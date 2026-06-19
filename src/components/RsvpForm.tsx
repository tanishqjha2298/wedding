import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Music, User, UserPlus, X, ThumbsUp, Send, Loader2, Heart } from 'lucide-react';
import { RsvpFormState, AttendanceOption, GuestSide } from '../types';
import { weddingEvents } from '../data/events';
import { site } from '../config';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured, logFirestoreError, OperationType } from '../firebase';

interface RsvpFormProps {
  isFriendsAuthorized: boolean;
}

const MAX_ADDITIONAL_GUESTS = 2;

type StepKey = 'names' | 'side' | 'attendance' | 'events' | 'song';

const stepLabels: Record<StepKey, string> = {
  names: 'Your Party',
  side: 'Whose Side',
  attendance: 'Attendance',
  events: 'Ceremonies',
  song: 'Song Request',
};

function buildSteps(attendance: AttendanceOption | null): StepKey[] {
  const base: StepKey[] = ['names', 'side', 'attendance'];
  return attendance === 'NO' ? [...base, 'song'] : [...base, 'events', 'song'];
}

export default function RsvpForm({ isFriendsAuthorized }: RsvpFormProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState<RsvpFormState>({
    fullName: '',
    additionalGuests: [],
    side: null,
    attendance: null,
    selectedEvents: { haldi: true, sangeet: true, wedding: true, friendshang: isFriendsAuthorized },
    songRequest: '',
  });

  // If friend status resolves after mount (e.g. storage read), make sure the
  // friends-only event becomes pre-selected rather than staying stale.
  useEffect(() => {
    if (isFriendsAuthorized) {
      setFormData((prev) =>
        prev.selectedEvents.friendshang
          ? prev
          : { ...prev, selectedEvents: { ...prev.selectedEvents, friendshang: true } },
      );
    }
  }, [isFriendsAuthorized]);

  const [errors, setErrors] = useState<{ fullName?: string; side?: string; attendance?: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const steps = buildSteps(formData.attendance);
  const step = steps[stepIndex];
  const totalSteps = steps.length;

  const availableEventsForRsvp = weddingEvents.filter(
    (event) => !event.isFriendsOnly || isFriendsAuthorized,
  );

  const partySize = 1 + formData.additionalGuests.filter((g) => g.trim()).length;

  // ── Party (names) helpers ────────────────────────────────────────────────
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, fullName: e.target.value });
    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, fullName: undefined }));
  };

  const addGuest = () => {
    if (formData.additionalGuests.length >= MAX_ADDITIONAL_GUESTS) return;
    setFormData({ ...formData, additionalGuests: [...formData.additionalGuests, ''] });
  };

  const updateGuest = (i: number, value: string) => {
    const next = [...formData.additionalGuests];
    next[i] = value;
    setFormData({ ...formData, additionalGuests: next });
  };

  const removeGuest = (i: number) => {
    setFormData({
      ...formData,
      additionalGuests: formData.additionalGuests.filter((_, idx) => idx !== i),
    });
  };

  const handleSideSelect = (side: GuestSide) => {
    setFormData({ ...formData, side });
    setErrors((prev) => ({ ...prev, side: undefined }));
  };

  const handleAttendanceSelect = (option: AttendanceOption) => {
    setFormData({ ...formData, attendance: option });
    setErrors((prev) => ({ ...prev, attendance: undefined }));
  };

  const handleEventToggle = (eventId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedEvents: { ...prev.selectedEvents, [eventId]: !prev.selectedEvents[eventId] },
    }));
  };

  // ── Navigation ───────────────────────────────────────────────────────────
  const validateCurrent = (): boolean => {
    if (step === 'names' && !formData.fullName.trim()) {
      setErrors((prev) => ({ ...prev, fullName: 'Please enter your name so we can find you.' }));
      return false;
    }
    if (step === 'side' && !formData.side) {
      setErrors((prev) => ({ ...prev, side: 'Please let us know whose side you are joining from.' }));
      return false;
    }
    if (step === 'attendance' && !formData.attendance) {
      setErrors((prev) => ({ ...prev, attendance: 'Please select your attendance status.' }));
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateCurrent()) return;
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  };

  const prevStep = () => setStepIndex((i) => Math.max(i - 1, 0));

  const isLastStep = step === 'song';

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFirebaseConfigured || !db) {
      setSubmitError(
        'Our RSVP system is being set up — please try again shortly, or reach out to us directly.',
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const rsvpRef = doc(collection(db, 'rsvps'));
      const declined = formData.attendance === 'NO';
      const payload = {
        fullName: formData.fullName.trim(),
        additionalGuests: formData.additionalGuests.map((g) => g.trim()).filter(Boolean),
        side: formData.side,
        attendance: formData.attendance,
        selectedEvents: declined ? {} : formData.selectedEvents,
        songRequest: formData.songRequest.trim() || '',
        createdAt: serverTimestamp(),
      };

      await setDoc(rsvpRef, payload);
      setIsSubmitted(true);
    } catch (error) {
      logFirestoreError(error, OperationType.CREATE, 'rsvps');
      setSubmitError('Something went wrong sending your RSVP. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setStepIndex(0);
    setSubmitError(null);
    setFormData({
      fullName: '',
      additionalGuests: [],
      side: null,
      attendance: null,
      selectedEvents: { haldi: true, sangeet: true, wedding: true, friendshang: isFriendsAuthorized },
      songRequest: '',
    });
  };

  const attendanceOptions: { id: AttendanceOption; title: string; subtitle: string }[] = [
    { id: 'YES', title: 'Count us in! Padharo Mhare Des', subtitle: "Wouldn't miss it for the world." },
    { id: 'VISA', title: 'Counting down the days (Visa Pending)', subtitle: 'Will be there the moment my visa permits!' },
    { id: 'NO', title: 'Sending love from afar', subtitle: "Sadly can't make it to Bikaner, but celebrating in spirit." },
  ];

  const sideOptions: { id: GuestSide; title: string; subtitle: string }[] = [
    { id: 'BRIDE', title: `Bride's Side`, subtitle: `Here for ${site.couple.bride}` },
    { id: 'GROOM', title: `Groom's Side`, subtitle: `Here for ${site.couple.groom}` },
    { id: 'BOTH', title: 'Both', subtitle: 'Friends of the couple' },
  ];

  const sideLabel = (s: GuestSide | null) =>
    s === 'BRIDE' ? `${site.couple.bride}'s Side`
    : s === 'GROOM' ? `${site.couple.groom}'s Side`
    : s === 'BOTH' ? 'Both Sides' : '';

  return (
    <section id="rsvp-section" className="py-24 px-4 bg-[#fbf9f4] border-y border-stone-warm bg-jaali-rose bg-[size:32px_32px] select-none">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-serif italic text-lg sm:text-xl text-clay-rose block mb-2">Aavedan Patra</span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-stone-dark tracking-tight mb-3 uppercase">
            Will You Join Us?
          </h2>
          <p className="text-xs sm:text-sm font-sans font-light tracking-wide text-stone-muted max-w-sm mx-auto">
            Please respond by {site.rsvpDeadline}. This helps us plan every detail at the palace.
          </p>
        </div>

        <div className="bg-cream/95 border-2 border-sand-gold/40 rounded-3xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(190,83,60,0.04)] overflow-hidden relative min-h-[380px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.35 }}
                className="flex-grow flex flex-col justify-between"
              >
                <div>
                  {/* Step indicator */}
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-warm/50 text-xs text-stone-muted font-sans">
                    <span className="uppercase tracking-wider font-semibold text-clay-rose">{stepLabels[step]}</span>
                    <span className="font-mono text-xs font-semibold text-sand-gold">
                      Step {stepIndex + 1} of {totalSteps}
                    </span>
                  </div>

                  {/* STEP: names + party */}
                  {step === 'names' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="full-name" className="block font-serif italic text-lg sm:text-xl text-stone-dark">
                          Who are we celebrating with?
                        </label>
                        <p className="text-xs font-sans text-stone-muted font-light leading-relaxed">
                          Enter your name. Bringing a partner or family? Add them below so we count everyone correctly.
                        </p>
                        <div className="relative mt-3">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-muted">
                            <User className="w-4 h-4 text-clay-rose shrink-0" />
                          </span>
                          <input
                            type="text"
                            id="full-name"
                            value={formData.fullName}
                            onChange={handleNameChange}
                            placeholder="Your full name"
                            className="bg-cream focus:bg-white w-full pl-10 pr-4 py-4 rounded-xl border border-stone-warm text-sm text-stone-dark placeholder-stone-muted/50 focus:border-clay-rose focus:ring-1 focus:ring-clay-rose outline-none transition-all font-sans font-light"
                          />
                        </div>
                        {errors.fullName && (
                          <p className="text-xs font-sans text-clay-rose font-semibold mt-1">{errors.fullName}</p>
                        )}
                      </div>

                      {/* Additional guests */}
                      <div className="space-y-3">
                        <AnimatePresence initial={false}>
                          {formData.additionalGuests.map((guest, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="relative"
                            >
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-muted">
                                <UserPlus className="w-4 h-4 text-sand-gold shrink-0" />
                              </span>
                              <input
                                type="text"
                                value={guest}
                                onChange={(e) => updateGuest(i, e.target.value)}
                                placeholder={`Guest ${i + 2} full name`}
                                className="bg-cream focus:bg-white w-full pl-10 pr-10 py-3.5 rounded-xl border border-stone-warm text-sm text-stone-dark placeholder-stone-muted/50 focus:border-clay-rose focus:ring-1 focus:ring-clay-rose outline-none transition-all font-sans font-light"
                              />
                              <button
                                type="button"
                                onClick={() => removeGuest(i)}
                                aria-label="Remove guest"
                                className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center text-stone-muted hover:text-clay-rose transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {formData.additionalGuests.length < MAX_ADDITIONAL_GUESTS && (
                          <button
                            type="button"
                            onClick={addGuest}
                            className="cursor-pointer w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-sand-gold/60 text-clay-rose text-xs font-sans font-semibold uppercase tracking-wider hover:bg-orange-50/40 transition-all"
                          >
                            <UserPlus className="w-4 h-4" />
                            Add a guest
                            <span className="text-stone-muted font-normal normal-case tracking-normal">
                              (up to {MAX_ADDITIONAL_GUESTS} more)
                            </span>
                          </button>
                        )}

                        {partySize > 1 && (
                          <p className="text-[11px] font-sans text-stone-muted text-center">
                            Your party: <strong className="text-clay-rose font-semibold">{partySize} {partySize === 1 ? 'guest' : 'guests'}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP: side */}
                  {step === 'side' && (
                    <div className="space-y-4">
                      <h3 className="font-serif italic text-lg sm:text-xl text-stone-dark mb-1">
                        Whose side are you joining us from?
                      </h3>
                      <p className="text-xs font-sans text-stone-muted font-light mb-4 leading-relaxed">
                        Just so we can seat you with your people and balance the celebrations.
                      </p>
                      <div className="space-y-3.5">
                        {sideOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSideSelect(option.id)}
                            className={`cursor-pointer w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${
                              formData.side === option.id
                                ? 'border-clay-rose bg-orange-50/20 shadow-sm'
                                : 'border-stone-warm hover:border-clay-rose/40 hover:bg-orange-50/5'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              formData.side === option.id ? 'border-clay-rose bg-clay-rose' : 'border-stone-warm'
                            }`}>
                              {formData.side === option.id && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-sans font-semibold text-stone-dark">{option.title}</p>
                              <p className="text-xs font-sans font-light text-stone-muted mt-0.5">{option.subtitle}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      {errors.side && (
                        <p className="text-xs font-sans text-clay-rose font-semibold mt-1">{errors.side}</p>
                      )}
                    </div>
                  )}

                  {/* STEP: attendance */}
                  {step === 'attendance' && (
                    <div className="space-y-4">
                      <h3 className="font-serif italic text-lg sm:text-xl text-stone-dark mb-4">
                        Will you join us in Bikaner, Rajasthan?
                      </h3>
                      <div className="space-y-3.5">
                        {attendanceOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleAttendanceSelect(option.id)}
                            className={`cursor-pointer w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${
                              formData.attendance === option.id
                                ? 'border-clay-rose bg-orange-50/20 shadow-sm'
                                : 'border-stone-warm hover:border-clay-rose/40 hover:bg-orange-50/5'
                            }`}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              formData.attendance === option.id ? 'border-clay-rose bg-clay-rose' : 'border-stone-warm'
                            }`}>
                              {formData.attendance === option.id && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-sans font-semibold text-stone-dark">{option.title}</p>
                              <p className="text-xs font-sans font-light text-stone-muted mt-1 leading-relaxed">{option.subtitle}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      {errors.attendance && (
                        <p className="text-xs font-sans text-clay-rose font-semibold mt-1">{errors.attendance}</p>
                      )}
                    </div>
                  )}

                  {/* STEP: events */}
                  {step === 'events' && (
                    <div className="space-y-4">
                      <h3 className="font-serif italic text-lg sm:text-xl text-stone-dark mb-2">
                        Which ceremonies will your party attend?
                      </h3>
                      <p className="text-xs font-sans text-stone-muted font-light mb-4 leading-relaxed">
                        This helps us coordinate seating, catering, and transfers for everyone in your group.
                      </p>
                      <div className="space-y-3">
                        {availableEventsForRsvp.map((event) => {
                          const isChecked = formData.selectedEvents[event.id] ?? false;
                          return (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => handleEventToggle(event.id)}
                              className={`cursor-pointer w-full text-left p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                                isChecked ? 'border-clay-rose bg-orange-50/20 shadow-sm' : 'border-stone-warm/80 hover:border-clay-rose/40'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="text-xs sm:text-sm font-sans font-semibold text-stone-dark flex items-center gap-2">
                                  {event.name}
                                </span>
                                <span className="text-[10px] md:text-[11px] font-mono text-sand-gold mt-1 uppercase tracking-wider font-semibold">
                                  {event.date.split(',')[1]} at {event.time.split(' ')[0]} {event.time.split(' ')[1]}
                                </span>
                              </div>
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                isChecked ? 'bg-clay-rose border-clay-rose' : 'border-stone-warm'
                              }`}>
                                {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP: song */}
                  {step === 'song' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="song-request" className="block font-serif italic text-lg sm:text-xl text-stone-dark leading-relaxed">
                          Any song that will get you on the sangeet floor?
                        </label>
                        <p className="text-xs font-sans text-stone-muted font-light leading-relaxed">
                          Our DJ is building the playlist from our guests' favourites. Share yours (optional).
                        </p>
                        <div className="relative mt-4">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-muted">
                            <Music className="w-4 h-4 text-clay-rose shrink-0" />
                          </span>
                          <input
                            type="text"
                            id="song-request"
                            value={formData.songRequest}
                            onChange={(e) => setFormData({ ...formData, songRequest: e.target.value })}
                            placeholder="Song title, album or artist"
                            className="bg-cream focus:bg-white w-full pl-10 pr-4 py-4 rounded-xl border border-stone-warm text-sm text-stone-dark placeholder-stone-muted/50 focus:border-clay-rose focus:ring-1 focus:ring-clay-rose outline-none transition-all font-sans font-light"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {submitError && (
                  <p className="text-xs font-sans text-clay-rose font-semibold bg-red-50/50 p-3 rounded-xl border border-clay-rose/20 text-center mt-4">
                    {submitError}
                  </p>
                )}

                <div className="flex items-center justify-between gap-4 mt-10 pt-4 border-t border-stone-warm/50">
                  {stepIndex > 0 ? (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={prevStep}
                      className="cursor-pointer text-xs font-sans font-bold uppercase tracking-[0.12em] text-stone-muted hover:text-clay-rose py-2 px-4 transition-colors disabled:opacity-50"
                    >
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {!isLastStep ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="cursor-pointer bg-clay-rose text-white text-xs font-sans font-bold uppercase tracking-widest py-3.5 px-7 rounded-full hover:bg-clay-dark transition-all flex items-center gap-1 shadow-md"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                      className="cursor-pointer bg-clay-rose text-white text-xs font-sans font-bold uppercase tracking-widest py-3.5 px-8 rounded-full hover:bg-clay-dark transition-all flex items-center gap-2 shadow-md disabled:opacity-85"
                    >
                      {isSubmitting ? (
                        <>Sending...<Loader2 className="w-3.5 h-3.5 text-white animate-spin shrink-0" /></>
                      ) : (
                        <>Submit Response<Send className="w-3.5 h-3.5 text-white shrink-0" /></>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              // Success
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-6 flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-orange-50 border border-clay-rose/20 flex items-center justify-center text-clay-rose mb-6">
                  <ThumbsUp className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="font-display text-2xl font-bold text-stone-dark uppercase tracking-wide">Dhanyavaad</h3>
                <p className="font-serif italic text-lg text-stone-muted mb-6">{formData.fullName}</p>
                <div className="w-12 h-px bg-sand-gold/50 mb-6" />

                <div className="space-y-4 w-full text-left bg-white p-6 rounded-2xl border border-stone-warm text-xs font-sans text-stone-dark leading-relaxed mb-6">
                  <p className="font-bold text-clay-rose border-b border-stone-warm/50 pb-2 mb-2 uppercase tracking-wide text-[10px]">
                    Response Summary
                  </p>
                  <p>
                    <span className="text-stone-muted font-light">Party: </span>
                    <strong className="text-stone-dark font-semibold">
                      {[formData.fullName, ...formData.additionalGuests.filter((g) => g.trim())].join(', ')}
                      {' '}({partySize})
                    </strong>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-stone-muted font-light">Side: </span>
                    <Heart className="w-3 h-3 text-clay-rose shrink-0" />
                    <strong className="text-stone-dark font-semibold">{sideLabel(formData.side)}</strong>
                  </p>
                  <p>
                    <span className="text-stone-muted font-light">Attendance: </span>
                    <strong className="text-stone-dark font-semibold">
                      {formData.attendance === 'YES' && 'Attending! (Padharo Mhare Des)'}
                      {formData.attendance === 'VISA' && 'Attending, pending visa'}
                      {formData.attendance === 'NO' && 'Declined (celebrating from afar)'}
                    </strong>
                  </p>
                  {formData.attendance !== 'NO' && (
                    <p>
                      <span className="text-stone-muted font-light">Ceremonies: </span>
                      <strong className="text-stone-dark font-semibold">
                        {Object.entries(formData.selectedEvents)
                          .filter(([, checked]) => checked)
                          .map(([id]) => weddingEvents.find((e) => e.id === id)?.name || id)
                          .join(', ') || 'None selected'}
                      </strong>
                    </p>
                  )}
                  {formData.songRequest && (
                    <p>
                      <span className="text-stone-muted font-light">Song: </span>
                      <span className="italic text-clay-rose font-medium">"{formData.songRequest}"</span>
                    </p>
                  )}
                </div>

                <p className="text-xs font-sans text-stone-muted font-light italic max-w-xs leading-relaxed">
                  Your response has been saved and the hosts have been notified. We cannot wait to celebrate with you in Bikaner!
                </p>

                <button
                  type="button"
                  onClick={resetForm}
                  className="cursor-pointer text-xs font-sans text-clay-rose font-bold underline hover:text-clay-dark mt-8 transition-colors uppercase tracking-wider"
                >
                  Submit Another RSVP
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
