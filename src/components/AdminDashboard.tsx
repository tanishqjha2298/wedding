import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users, ShieldAlert, LogIn, LogOut, Search, Filter,
  Calendar, Music, TrendingUp, Settings, Trash2, Loader2,
  ArrowUp, ArrowDown, ArrowUpDown,
} from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import {
  auth, db, ADMIN_EMAILS, isFirebaseConfigured,
  signInWithGoogle, logFirestoreError, OperationType,
} from '../firebase';
import { RsvpFormState, GuestSide } from '../types';
import { weddingEvents } from '../data/events';
import { site } from '../config';

interface FirebaseRsvp extends RsvpFormState {
  id: string;
  createdAt?: Timestamp | null;
}

const partySize = (r: FirebaseRsvp) => 1 + (r.additionalGuests?.length || 0);
const partyNames = (r: FirebaseRsvp) => [r.fullName, ...(r.additionalGuests || [])].filter(Boolean);
const sideLabel = (s: GuestSide | null | undefined) =>
  s === 'BRIDE' ? `${site.couple.bride}'s` : s === 'GROOM' ? `${site.couple.groom}'s` : s === 'BOTH' ? 'Both' : '—';

const eventNameMap: { [key: string]: string } = {
  haldi: 'Haldi',
  sangeet: 'Sangeet',
  wedding: 'Wedding',
  friendshang: 'Crew Hang',
};

type SortKey = 'date' | 'name' | 'side' | 'status' | 'party';
// Grouping order for side/status sorts.
const SIDE_RANK: Record<string, number> = { BRIDE: 0, GROOM: 1, BOTH: 2 };
const STATUS_RANK: Record<string, number> = { YES: 0, VISA: 1, NO: 2 };

export default function AdminDashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [rsvps, setRsvps] = useState<FirebaseRsvp[]>([]);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAttendance, setFilterAttendance] = useState('all');
  const [filterSide, setFilterSide] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [authError, setAuthError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = Boolean(
    user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()),
  );

  // Monitor auth state
  useEffect(() => {
    if (!auth) {
      setAuthChecking(false);
      return;
    }
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
  }, []);

  // Subscribe to RSVPs in real time (admins only)
  useEffect(() => {
    if (!isAdmin || !db) {
      setRsvps([]);
      return;
    }

    setLoading(true);
    const rsvpsQuery = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));

    return onSnapshot(
      rsvpsQuery,
      (snapshot) => {
        setRsvps(
          snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              fullName: data.fullName || '',
              additionalGuests: data.additionalGuests || [],
              side: data.side ?? null,
              attendance: data.attendance || null,
              selectedEvents: data.selectedEvents || {},
              songRequest: data.songRequest || '',
              createdAt: (data.createdAt as Timestamp) ?? null,
            };
          }),
        );
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        logFirestoreError(error, OperationType.LIST, 'rsvps');
      },
    );
  }, [isAdmin]);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      const code = (e as { code?: string })?.code ?? '';
      const messages: Record<string, string> = {
        'auth/popup-blocked':
          'Your browser blocked the sign-in popup. Allow pop-ups for this site, then try again.',
        'auth/unauthorized-domain':
          'This domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.',
        'auth/operation-not-allowed':
          'Google sign-in is not enabled in Firebase yet (Authentication → Sign-in method → Google → Enable).',
        'auth/configuration-not-found':
          'Google sign-in is not configured in Firebase yet (Authentication → Sign-in method → Google → Enable).',
        'auth/popup-closed-by-user': 'Sign-in was cancelled.',
        'auth/cancelled-popup-request': 'Sign-in was cancelled.',
      };
      setAuthError(messages[code] || `Sign-in failed${code ? ` (${code})` : ''}. Please try again.`);
      console.error('Login failed:', e);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  // Permanently delete an RSVP from Firestore (host only; allowed by rules).
  // The real-time listener removes it from the table automatically.
  const handleDelete = async (id: string) => {
    if (!db) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'rsvps', id));
    } catch (e) {
      logFirestoreError(e, OperationType.DELETE, `rsvps/${id}`);
      alert('Could not delete this RSVP. Please try again.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // Stats — entries (responses) vs headcount (actual people)
  const headcount = (pred: (r: FirebaseRsvp) => boolean) =>
    rsvps.filter(pred).reduce((sum, r) => sum + partySize(r), 0);

  const totalRsvps = rsvps.length;
  const countAttending = rsvps.filter((r) => r.attendance === 'YES').length;
  const countVisa = rsvps.filter((r) => r.attendance === 'VISA').length;
  const countDeclined = rsvps.filter((r) => r.attendance === 'NO').length;

  const headcountYes = headcount((r) => r.attendance === 'YES');
  const headcountVisa = headcount((r) => r.attendance === 'VISA');
  const headcountComing = headcountYes + headcountVisa; // counts every named guest

  // Side breakdown (people who are attending or visa-pending)
  const sideHeadcount = (s: GuestSide) => headcount((r) => r.attendance !== 'NO' && r.side === s);

  const ceremonyCount = (id: string) =>
    headcount((r) => r.attendance !== 'NO' && r.selectedEvents[id]);

  const filteredRsvps = rsvps.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      partyNames(r).some((n) => n.toLowerCase().includes(q)) ||
      r.songRequest.toLowerCase().includes(q);
    const matchesAttendance = filterAttendance === 'all' || r.attendance === filterAttendance;
    const matchesSide = filterSide === 'all' || r.side === filterSide;
    return matchesSearch && matchesAttendance && matchesSide;
  });

  const sortedRsvps = [...filteredRsvps].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'name':
        cmp = a.fullName.localeCompare(b.fullName);
        break;
      case 'side':
        cmp = (SIDE_RANK[a.side ?? ''] ?? 9) - (SIDE_RANK[b.side ?? ''] ?? 9);
        break;
      case 'status':
        cmp = (STATUS_RANK[a.attendance ?? ''] ?? 9) - (STATUS_RANK[b.attendance ?? ''] ?? 9);
        break;
      case 'party':
        cmp = partySize(a) - partySize(b);
        break;
      case 'date':
      default:
        cmp = (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0);
        break;
    }
    if (cmp === 0) cmp = a.fullName.localeCompare(b.fullName); // stable tiebreak
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const filtersActive = searchQuery !== '' || filterAttendance !== 'all' || filterSide !== 'all';

  // Clicking a column header sorts by it; clicking the active one flips direction.
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'date' || key === 'party' ? 'desc' : 'asc');
    }
  };

  const sortArrow = (key: SortKey) =>
    sortKey === key ? (
      sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
    ) : (
      <ArrowUpDown className="w-3 h-3 opacity-30" />
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-6 mb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-warm/60 pb-6 mb-8">
        <div>
          <span className="font-serif italic text-sm text-clay-rose uppercase tracking-wider block">
            Wedding Hosts Console
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-stone-dark uppercase tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-clay-rose" />
            Live RSVP Registry
          </h2>
          <p className="text-xs font-sans text-stone-muted font-light mt-1">
            Real-time guest responses &amp; catering headcounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isFirebaseConfigured ? null : authChecking ? (
            <div className="text-xs font-mono text-stone-muted animate-pulse">Verifying…</div>
          ) : user ? (
            <div className="flex items-center gap-3 bg-white/80 p-1.5 pr-4 rounded-full border border-stone-warm shadow-sm">
              {user.photoURL && (
                <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
              )}
              <div className="text-left">
                <p className="text-[10px] sm:text-xs font-sans font-semibold text-stone-dark leading-none">
                  {user.displayName || 'Signed in'}
                </p>
                <p className="text-[9px] font-mono text-clay-rose/90 leading-tight">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="cursor-pointer p-1 text-stone-muted hover:text-clay-rose transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="cursor-pointer bg-stone-dark hover:bg-clay-rose text-cream text-xs font-sans font-semibold uppercase tracking-wider px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-md"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login with Google
            </button>
          )}
        </div>
      </div>

      {/* Not configured */}
      {!isFirebaseConfigured ? (
        <div className="bg-cream border-2 border-dashed border-stone-warm p-10 rounded-3xl text-center max-w-lg mx-auto shadow-sm">
          <Settings className="w-12 h-12 text-sand-gold mx-auto mb-4 stroke-[1.5]" />
          <h3 className="font-serif italic text-lg sm:text-xl text-stone-dark mb-2">
            Backend not connected yet
          </h3>
          <p className="text-xs font-sans font-light text-stone-muted leading-relaxed">
            Add your Firebase environment variables (see <strong>README.md</strong> →
            "Set up your own Firebase") to enable guest RSVP storage and this dashboard.
          </p>
        </div>
      ) : !isAdmin ? (
        /* Signed out, or signed in as a non-host account */
        <div className="bg-cream border-2 border-dashed border-stone-warm p-10 rounded-3xl text-center max-w-lg mx-auto shadow-sm">
          <ShieldAlert className="w-12 h-12 text-sand-gold mx-auto mb-4 stroke-[1.5]" />
          <h3 className="font-serif italic text-lg sm:text-xl text-stone-dark mb-2">
            Host authorization required
          </h3>
          <p className="text-xs font-sans font-light text-stone-muted leading-relaxed mb-6">
            Guest RSVPs contain personal information and are private. Sign in with the
            host Google account to view the registry.
            {user && (
              <>
                <br />
                <span className="text-clay-rose font-semibold">
                  {user.email} is not authorized.
                </span>
              </>
            )}
          </p>
          {!user && (
            <button
              onClick={handleLogin}
              className="cursor-pointer bg-clay-rose text-white text-xs font-sans font-bold uppercase tracking-widest py-3 px-6 rounded-full hover:bg-clay-dark transition-all inline-flex items-center gap-2 shadow-md"
            >
              <LogIn className="w-4 h-4" />
              Sign in as host
            </button>
          )}
          {authError && (
            <p className="mt-4 text-xs font-sans text-clay-rose font-semibold bg-red-50/60 border border-clay-rose/20 rounded-xl px-4 py-3 max-w-sm mx-auto leading-relaxed">
              {authError}
            </p>
          )}
        </div>
      ) : (
        /* Authorized host view */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Guests Coming', value: headcountComing, color: 'text-emerald-600', note: 'Total heads (Yes + Visa)' },
              { label: 'Confirmed (Yes)', value: headcountYes, color: 'text-stone-dark', note: `${countAttending} ${countAttending === 1 ? 'response' : 'responses'}` },
              { label: 'Visa Pending', value: headcountVisa, color: 'text-amber-600', note: `${countVisa} ${countVisa === 1 ? 'response' : 'responses'}` },
              { label: 'Declined', value: countDeclined, color: 'text-red-500', note: `${totalRsvps} total responses` },
            ].map((stat) => (
              <div key={stat.label} className="p-5 rounded-2xl border border-stone-warm bg-white shadow-sm flex flex-col justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-muted font-sans block mb-1">
                  {stat.label}
                </span>
                <span className={`font-display text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] text-stone-muted font-sans font-light mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                  {stat.note}
                </span>
              </div>
            ))}
          </div>

          {/* Ceremony headcounts */}
          <div className="bg-cream-stone/60 border border-stone-warm p-5 sm:p-6 rounded-2xl">
            <h4 className="font-serif italic text-base text-stone-dark flex items-center gap-1.5 mb-4">
              <Calendar className="w-4 h-4 text-clay-rose shrink-0" />
              Ceremony Headcounts (Catering &amp; Seating)
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              {[
                { name: 'Haldi', count: ceremonyCount('haldi'), date: 'Nov 25', color: 'bg-amber-400' },
                { name: 'Sangeet', count: ceremonyCount('sangeet'), date: 'Nov 25', color: 'bg-fuchsia-600' },
                { name: 'Wedding', count: ceremonyCount('wedding'), date: 'Nov 26', color: 'bg-rose-600' },
                { name: 'Crew Hang', count: ceremonyCount('friendshang'), date: 'Nov 26', color: 'bg-emerald-600' },
              ].map((c) => (
                <div key={c.name} className="bg-white p-4 rounded-xl border border-stone-warm/50 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 inset-x-0 h-1 ${c.color}`} />
                  <span className="text-xs font-semibold text-stone-dark">{c.name}</span>
                  <span className="text-[9px] text-stone-muted mt-0.5">{c.date}</span>
                  <div className="my-2.5 font-display text-3xl font-black text-clay-rose">{c.count}</div>
                  <span className="text-[9px] uppercase tracking-wider text-stone-muted font-sans font-semibold">Guests</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side breakdown */}
          <div className="bg-cream-stone/60 border border-stone-warm p-5 sm:p-6 rounded-2xl">
            <h4 className="font-serif italic text-base text-stone-dark flex items-center gap-1.5 mb-4">
              <Users className="w-4 h-4 text-clay-rose shrink-0" />
              Guests by Side (attending)
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { name: `${site.couple.bride}'s Side`, count: sideHeadcount('BRIDE'), color: 'bg-clay-rose' },
                { name: `${site.couple.groom}'s Side`, count: sideHeadcount('GROOM'), color: 'bg-royal-blue' },
                { name: 'Both', count: sideHeadcount('BOTH'), color: 'bg-sand-gold' },
              ].map((s) => (
                <div key={s.name} className="bg-white p-4 rounded-xl border border-stone-warm/50 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 inset-x-0 h-1 ${s.color}`} />
                  <span className="text-xs font-semibold text-stone-dark">{s.name}</span>
                  <div className="my-2.5 font-display text-3xl font-black text-clay-rose">{s.count}</div>
                  <span className="text-[9px] uppercase tracking-wider text-stone-muted font-sans font-semibold">Guests</span>
                </div>
              ))}
            </div>
          </div>

          {/* Registry */}
          <div className="bg-white rounded-2xl border border-stone-warm shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-warm/60 bg-stone-warm/10 space-y-3">
              {/* Row 1 — search + attendance filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative w-full sm:max-w-xs shrink-0">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-muted">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or song…"
                    className="bg-white w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-warm outline-none transition-all focus:border-clay-rose focus:ring-1 focus:ring-clay-rose"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto justify-end">
                  <Filter className="w-3.5 h-3.5 text-stone-muted shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-muted shrink-0 hidden sm:inline">Status</span>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-stone-warm">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'YES', label: 'Yes' },
                      { id: 'VISA', label: 'Visa' },
                      { id: 'NO', label: 'No' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setFilterAttendance(btn.id)}
                        className={`cursor-pointer px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide transition-all ${
                          filterAttendance === btn.id
                            ? 'bg-clay-rose text-white shadow-sm'
                            : 'text-stone-muted hover:text-stone-dark'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2 — side filter + sort control */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Users className="w-3.5 h-3.5 text-stone-muted shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-muted shrink-0">Side</span>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-stone-warm">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'BRIDE', label: `${site.couple.bride}'s` },
                      { id: 'GROOM', label: `${site.couple.groom}'s` },
                      { id: 'BOTH', label: 'Both' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setFilterSide(btn.id)}
                        className={`cursor-pointer px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide transition-all ${
                          filterSide === btn.id
                            ? 'bg-clay-rose text-white shadow-sm'
                            : 'text-stone-muted hover:text-stone-dark'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-muted shrink-0">Sort</span>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className="cursor-pointer bg-white border border-stone-warm rounded-full text-[10px] sm:text-xs font-semibold text-stone-dark px-3 py-1.5 outline-none focus:border-clay-rose"
                  >
                    <option value="date">Submitted</option>
                    <option value="name">Name</option>
                    <option value="side">Side</option>
                    <option value="status">Status</option>
                    <option value="party">Party size</option>
                  </select>
                  <button
                    onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                    title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
                    className="cursor-pointer p-1.5 rounded-full border border-stone-warm bg-white text-stone-muted hover:text-clay-rose transition-colors"
                  >
                    {sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Result count */}
              <p className="text-[10px] font-sans text-stone-muted">
                Showing <span className="font-semibold text-stone-dark">{sortedRsvps.length}</span> of {rsvps.length} responses
                {filtersActive && (
                  <button
                    onClick={() => { setSearchQuery(''); setFilterAttendance('all'); setFilterSide('all'); }}
                    className="cursor-pointer ml-2 text-clay-rose font-semibold hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </p>
            </div>

            {loading ? (
              <div className="p-20 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-clay-rose/20 border-t-clay-rose animate-spin" />
                <span className="text-xs font-mono text-stone-muted font-semibold tracking-wider uppercase">Loading…</span>
              </div>
            ) : sortedRsvps.length === 0 ? (
              <div className="p-16 text-center text-stone-muted font-sans font-light flex flex-col items-center gap-2">
                <ShieldAlert className="w-10 h-10 text-stone-warm" />
                <span>{filtersActive ? 'No responses match your filters.' : 'No RSVP entries yet.'}</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-warm/60 bg-stone-warm/5 text-[10px] sm:text-xs font-bold text-stone-muted uppercase tracking-wider">
                      <th className="py-4 px-5">
                        <button onClick={() => toggleSort('name')} className={`cursor-pointer inline-flex items-center gap-1 uppercase tracking-wider hover:text-clay-rose transition-colors ${sortKey === 'name' ? 'text-clay-rose' : ''}`}>
                          Guest / Party {sortArrow('name')}
                        </button>
                      </th>
                      <th className="py-4 px-5">
                        <button onClick={() => toggleSort('side')} className={`cursor-pointer inline-flex items-center gap-1 uppercase tracking-wider hover:text-clay-rose transition-colors ${sortKey === 'side' ? 'text-clay-rose' : ''}`}>
                          Side {sortArrow('side')}
                        </button>
                      </th>
                      <th className="py-4 px-5">
                        <button onClick={() => toggleSort('status')} className={`cursor-pointer inline-flex items-center gap-1 uppercase tracking-wider hover:text-clay-rose transition-colors ${sortKey === 'status' ? 'text-clay-rose' : ''}`}>
                          Status {sortArrow('status')}
                        </button>
                      </th>
                      <th className="py-4 px-5">Ceremonies</th>
                      <th className="py-4 px-5">Song Request</th>
                      <th className="py-4 px-5 text-right">
                        <button onClick={() => toggleSort('date')} className={`cursor-pointer inline-flex items-center gap-1 uppercase tracking-wider hover:text-clay-rose transition-colors ml-auto ${sortKey === 'date' ? 'text-clay-rose' : ''}`}>
                          Submitted {sortArrow('date')}
                        </button>
                      </th>
                      <th className="py-4 px-5 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRsvps.map((rsvp) => (
                      <tr key={rsvp.id} className="border-b border-stone-warm/40 last:border-0 hover:bg-stone-warm/10 text-xs sm:text-sm text-stone-dark transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{rsvp.fullName}</span>
                            {partySize(rsvp) > 1 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-clay-rose/10 text-clay-rose border border-clay-rose/20 text-[9px] font-bold shrink-0">
                                +{partySize(rsvp) - 1}
                              </span>
                            )}
                          </div>
                          {rsvp.additionalGuests && rsvp.additionalGuests.length > 0 && (
                            <div className="text-[10px] text-stone-muted font-light mt-0.5">
                              with {rsvp.additionalGuests.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="text-xs font-medium text-stone-dark/90">{sideLabel(rsvp.side)}</span>
                        </td>
                        <td className="py-3.5 px-5">
                          {rsvp.attendance === 'YES' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs font-bold">Attending</span>
                          )}
                          {rsvp.attendance === 'VISA' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] sm:text-xs font-bold">Visa Pending</span>
                          )}
                          {rsvp.attendance === 'NO' && (
                            <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] sm:text-xs font-bold">Declined</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 pr-2">
                          {rsvp.attendance === 'NO' ? (
                            <span className="text-stone-muted font-light text-xs italic">N/A</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {weddingEvents
                                .filter((event) => rsvp.selectedEvents[event.id])
                                .map((event) => (
                                  <span key={event.id} className="px-1.5 py-0.5 rounded bg-orange-50 text-clay-rose border border-clay-rose/15 text-[9px] font-sans font-semibold">
                                    {eventNameMap[event.id] || event.name}
                                  </span>
                                ))}
                              {Object.values(rsvp.selectedEvents).filter(Boolean).length === 0 && (
                                <span className="text-stone-muted font-light text-xs italic">None</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-5 max-w-[180px] break-words">
                          {rsvp.songRequest ? (
                            <span className="flex items-center gap-1.5 text-stone-dark/95">
                              <Music className="w-3.5 h-3.5 text-clay-rose shrink-0" />
                              <span className="italic">"{rsvp.songRequest}"</span>
                            </span>
                          ) : (
                            <span className="text-stone-muted font-light text-xs italic">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right text-[10px] font-mono text-stone-muted">
                          {rsvp.createdAt ? rsvp.createdAt.toDate().toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {confirmDeleteId === rsvp.id ? (
                            <span className="inline-flex items-center gap-2 justify-end">
                              <button
                                onClick={() => handleDelete(rsvp.id)}
                                disabled={deletingId === rsvp.id}
                                className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-full transition-all disabled:opacity-70"
                              >
                                {deletingId === rsvp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Delete'}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={deletingId === rsvp.id}
                                className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-stone-muted hover:text-stone-dark px-1.5 py-1 transition-colors"
                              >
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(rsvp.id)}
                              aria-label={`Remove RSVP for ${rsvp.fullName}`}
                              title="Remove this RSVP"
                              className="cursor-pointer p-1.5 rounded-lg text-stone-muted hover:text-red-600 hover:bg-red-50 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
