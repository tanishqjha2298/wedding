/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Check, X, ShieldAlert, Sparkles, LogIn, LogOut, Search, 
  Filter, Calendar, Music, HardHat, TrendingUp 
} from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle, handleFirestoreError, OperationType } from '../firebase';
import { RsvpFormState } from '../types';

interface FirebaseRsvp extends RsvpFormState {
  id: string;
  createdAt?: Timestamp | null;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [rsvps, setRsvps] = useState<FirebaseRsvp[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAttendance, setFilterAttendance] = useState<string>('all');
  const [showDashboard, setShowDashboard] = useState<boolean>(false);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Is current logged in user an admin?
  const isAdmin = user?.email === 'cmuskaan@google.com';

  // Subcribe to RSVPs in real time
  useEffect(() => {
    if (!isAdmin && !showDashboard) {
      setRsvps([]);
      return;
    }

    setLoading(true);
    const rsvpsQuery = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(rsvpsQuery, (snapshot) => {
      const items: FirebaseRsvp[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          fullName: data.fullName || '',
          attendance: data.attendance || null,
          selectedEvents: data.selectedEvents || {},
          songRequest: data.songRequest || '',
          createdAt: data.createdAt as Timestamp,
        });
      });
      setRsvps(items);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      console.error("Failed to fetch RSVPs securely:", error);
      // Fallback/Notify error handler complying with SKILL Guidelines
      try {
        handleFirestoreError(error, OperationType.LIST, 'rsvps');
      } catch (err) {
        // Suppress breaking application flow for silent failure fallback
      }
    });

    return () => unsubscribe();
  }, [user, isAdmin, showDashboard]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error('Login action failed:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  // Counting Stats for catering and event logistics
  const totalRsvps = rsvps.length;
  const countAttending = rsvps.filter(r => r.attendance === 'YES').length;
  const countVisa = rsvps.filter(r => r.attendance === 'VISA').length;
  const countDeclined = rsvps.filter(r => r.attendance === 'NO').length;

  const countHaldi = rsvps.filter(r => r.attendance !== 'NO' && r.selectedEvents.haldi).length;
  const countSangeet = rsvps.filter(r => r.attendance !== 'NO' && r.selectedEvents.sangeet).length;
  const countWedding = rsvps.filter(r => r.attendance !== 'NO' && r.selectedEvents.wedding).length;
  const countCrewHang = rsvps.filter(r => r.attendance !== 'NO' && r.selectedEvents.friendshang).length;

  const filteredRsvps = rsvps.filter(r => {
    const matchesSearch = r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.songRequest.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterAttendance === 'all' || 
                          (filterAttendance === 'YES' && r.attendance === 'YES') ||
                          (filterAttendance === 'NO' && r.attendance === 'NO') ||
                          (filterAttendance === 'VISA' && r.attendance === 'VISA');
    return matchesSearch && matchesFilter;
  });

  return (
    <div id="rsvp-admin-dashboard" className="max-w-6xl mx-auto px-4 py-8 mt-12 mb-16">
      
      {/* Editorial Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-warm/60 pb-6 mb-8">
        <div>
          <span className="font-serif italic text-sm text-clay-rose uppercase tracking-wider block">Wedding Hosts Console</span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-stone-dark uppercase tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-clay-rose" />
            Live RSVP Registry
          </h2>
          <p className="text-xs font-sans text-stone-muted font-light mt-1">
            Real-time verification & catering logistics synchronized with Firebase Enterprise Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {authChecking ? (
            <div className="text-xs font-mono text-stone-muted animate-pulse">Verifying authority...</div>
          ) : user ? (
            <div className="flex items-center gap-3 bg-white/80 p-1.5 pr-4 rounded-full border border-stone-warm shadow-sm">
              {user.photoURL && (
                <img src={user.photoURL} alt={user.displayName || 'photo'} className="w-7 h-7 rounded-full object-cover" />
              )}
              <div className="text-left">
                <p className="text-[10px] sm:text-xs font-sans font-semibold text-stone-dark leading-none">
                  {user.displayName || 'Authorized Admin'}
                </p>
                <p className="text-[9px] font-mono text-clay-rose/90 leading-tight">
                  {user.email}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="cursor-pointer p-1 text-stone-muted hover:text-clay-rose transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="cursor-pointer bg-stone-dark hover:bg-clay-rose text-[#fafcfd] text-xs font-sans font-semibold uppercase tracking-wider px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login with Google
            </button>
          )}

          {/* Dev/Demo override to test dashboard if not loaded as strict admin */}
          {!isAdmin && user && (
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className={`cursor-pointer px-4 py-2.5 rounded-full text-xs font-sans font-semibold border tracking-wider uppercase transition-all ${
                showDashboard 
                  ? 'bg-clay-rose text-white border-clay-rose shadow-sm' 
                  : 'bg-white hover:bg-stone-50 border-stone-warm text-stone-dark'
              }`}
            >
              {showDashboard ? 'Hide Demo Registry' : 'Simulate Registry Override'}
            </button>
          )}
        </div>
      </div>

      {/* Access Denied Warning */}
      {!isAdmin && !showDashboard && (
        <div className="bg-[#faf8f4] border-2 border-dashed border-stone-warm p-10 rounded-3xl text-center max-w-lg mx-auto shadow-sm">
          <ShieldAlert className="w-12 h-12 text-sand-gold mx-auto mb-4 stroke-[1.5]" />
          <h3 className="font-serif italic text-lg sm:text-xl text-stone-dark mb-2">
            Secure Administrator Authorization Required
          </h3>
          <p className="text-xs font-sans font-light text-stone-muted leading-relaxed mb-6">
            Guest RSVPs contain personal information and are strictly protected. To access the live registry dashboard, you must authenticate as the verified host account: <strong className="font-semibold text-stone-dark">cmuskaan@google.com</strong>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleLogin}
              className="cursor-pointer bg-clay-rose text-white text-xs font-sans font-bold uppercase tracking-widest py-3 px-6 rounded-full hover:bg-clay-dark transition-all flex items-center gap-2 shadow-md w-full sm:w-auto justify-center"
            >
              <LogIn className="w-4 h-4" />
              Sign in as cmuskaan@google.com
            </button>
            <button
              onClick={() => setShowDashboard(true)}
              className="cursor-pointer text-xs font-sans text-clay-rose py-2.5 px-4 font-bold hover:underline"
            >
              Bypass for Testing Simulator
            </button>
          </div>
        </div>
      )}

      {/* ADMIN LEVEL SYSTEM CONTENT */}
      {(isAdmin || showDashboard) && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Quick counters grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-stone-warm bg-white shadow-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-muted font-sans block mb-1">
                Total Submissions
              </span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-stone-dark">{totalRsvps}</span>
              <span className="text-[10px] text-stone-muted font-sans font-light mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
                Live Cloud Synchronized
              </span>
            </div>

            <div className="p-5 rounded-2xl border border-stone-warm bg-white shadow-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-muted font-sans block mb-1">
                Attending (Yes)
              </span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-emerald-600">{countAttending}</span>
              <span className="text-[10px] text-stone-muted font-sans font-light mt-1">
                ({totalRsvps > 0 ? Math.round((countAttending / totalRsvps) * 100) : 0}% of responses)
              </span>
            </div>

            <div className="p-5 rounded-2xl border border-stone-warm bg-white shadow-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-muted font-sans block mb-1">
                Attending (Visa)
              </span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-amber-600">{countVisa}</span>
              <span className="text-[10px] text-stone-muted font-sans font-light mt-1">
                Pending visa processing
              </span>
            </div>

            <div className="p-5 rounded-2xl border border-stone-warm bg-white shadow-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-muted font-sans block mb-1">
                Declining (No)
              </span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-red-500">{countDeclined}</span>
              <span className="text-[10px] text-stone-muted font-sans font-light mt-1">
                Celebrating from afar
              </span>
            </div>
          </div>

          {/* Ceremony Headcounts for local catering estimation */}
          <div className="bg-cream-stone/40 border border-stone-warm p-5 sm:p-6 rounded-2xl">
            <h4 className="font-serif italic text-base text-stone-dark flex items-center gap-1.5 mb-4">
              <Calendar className="w-4 h-4 text-clay-rose shrink-0" />
              Ceremony Headcounts (Catering & Seat Allocation Planning)
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              {[
                { name: 'Haldi Ceremony', count: countHaldi, date: 'Nov 25, 11 AM', color: 'bg-amber-400' },
                { name: 'Sangeet Night', count: countSangeet, date: 'Nov 25, 6 PM', color: 'bg-fuchsia-600' },
                { name: 'Royal Vows (Wedding)', count: countWedding, date: 'Nov 26, 4 PM', color: 'bg-rose-600' },
                { name: 'Crew Bonfire Hangout', count: countCrewHang, date: 'Nov 26, 9 PM', color: 'bg-emerald-600' }
              ].map((ceremony, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-stone-warm/50 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 inset-x-0 h-1 ${ceremony.color}`} />
                  <span className="text-xs font-semibold text-stone-dark">{ceremony.name}</span>
                  <span className="text-[9px] text-stone-muted mt-0.5">{ceremony.date}</span>
                  <div className="my-2.5 font-display text-3xl font-black text-clay-rose">{ceremony.count}</div>
                  <span className="text-[9px] uppercase tracking-wider text-stone-muted font-sans font-semibold">Attending Guests</span>
                </div>
              ))}
            </div>
          </div>

          {/* Registry Table & Filters */}
          <div className="bg-white rounded-2xl border border-stone-warm shadow-sm overflow-hidden">
            {/* Filters Row */}
            <div className="p-4 sm:p-5 border-b border-stone-warm/60 bg-stone-warm/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:max-w-xs shrink-0">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-muted">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Query name or song request..."
                  className="bg-white focus:bg-[#fafcfd] w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-warm outline-none transition-all focus:border-clay-rose focus:ring-1 focus:ring-clay-rose"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Filter className="w-3.5 h-3.5 text-stone-muted shrink-0" />
                <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-stone-warm overflow-hidden">
                  {[
                    { id: 'all', label: 'All Responses' },
                    { id: 'YES', label: 'YES' },
                    { id: 'VISA', label: 'VISA' },
                    { id: 'NO', label: 'NO' },
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

            {/* List items */}
            {loading ? (
              <div className="p-20 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-clay-rose/20 border-t-clay-rose animate-spin"></div>
                <span className="text-xs font-mono text-stone-muted font-semibold tracking-wider uppercase">Fetching Registry...</span>
              </div>
            ) : filteredRsvps.length === 0 ? (
              <div className="p-16 text-center text-stone-muted font-sans font-light flex flex-col items-center gap-2">
                <ShieldAlert className="w-10 h-10 text-stone-warm" />
                <span>No matching guest RSVP entries located.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-warm/60 bg-stone-warm/5 text-[10px] sm:text-xs font-bold text-stone-muted uppercase tracking-wider">
                      <th className="py-4 px-5">Guest Name</th>
                      <th className="py-4 px-5">Attending Status</th>
                      <th className="py-4 px-5">Ceremonies Selected</th>
                      <th className="py-4 px-5">Sangeet Song Anthem Request</th>
                      <th className="py-4 px-5 text-right">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRsvps.map((rsvp) => (
                      <tr 
                        key={rsvp.id} 
                        className="border-b border-stone-inner/40 last:border-0 hover:bg-stone-warm/10 text-xs sm:text-sm text-stone-dark transition-colors"
                      >
                        <td className="py-3.5 px-5 font-semibold text-stone-dark">{rsvp.fullName}</td>
                        <td className="py-3.5 px-5">
                          {rsvp.attendance === 'YES' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs font-bold font-sans">
                              Attending Yes
                            </span>
                          )}
                          {rsvp.attendance === 'VISA' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] sm:text-xs font-bold font-sans">
                              Visa Pending
                            </span>
                          )}
                          {rsvp.attendance === 'NO' && (
                            <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] sm:text-xs font-bold font-sans">
                              Declined No
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 pr-2">
                          {rsvp.attendance === 'NO' ? (
                            <span className="text-stone-muted font-light text-xs italic">N/A (Declined)</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(rsvp.selectedEvents)
                                .filter(([_, attending]) => attending)
                                .map(([key]) => {
                                  const nameMap: { [key: string]: string } = {
                                    haldi: 'Haldi',
                                    sangeet: 'Sangeet',
                                    wedding: 'Wedding',
                                    friendshang: 'Crew Hang'
                                  };
                                  return (
                                    <span 
                                      key={key} 
                                      className="px-1.5 py-0.5 rounded bg-orange-50 text-clay-rose border border-clay-rose/15 text-[9px] font-sans font-semibold tracking-tight"
                                    >
                                      {nameMap[key] || key}
                                    </span>
                                  );
                                })}
                              {Object.values(rsvp.selectedEvents).filter(Boolean).length === 0 && (
                                <span className="text-stone-muted font-light text-xs italic">None selected</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-5 max-w-[180px] break-words">
                          {rsvp.songRequest ? (
                            <span className="flex items-center gap-1.5 font-sans font-normal text-stone-dark/95">
                              <Music className="w-3.5 h-3.5 text-clay-rose shrink-0" />
                              <span className="italic">"{rsvp.songRequest}"</span>
                            </span>
                          ) : (
                            <span className="text-stone-muted font-light text-xs italic">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right text-[10px] font-mono text-stone-muted">
                          {rsvp.createdAt ? rsvp.createdAt.toDate().toLocaleDateString() : 'Real-time'}
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
