/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Music, User, ThumbsUp, Send, Sparkles, Loader2 } from 'lucide-react';
import { RsvpFormState, AttendanceOption } from '../types';
import { weddingEvents } from '../data/events';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface RsvpFormProps {
  isFriendsAuthorized: boolean;
  onSubmitMock: (data: RsvpFormState) => void;
}

export default function RsvpForm({ isFriendsAuthorized, onSubmitMock }: RsvpFormProps) {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<RsvpFormState>({
    fullName: '',
    attendance: null,
    selectedEvents: {
      haldi: true,
      sangeet: true,
      wedding: true,
      friendshang: isFriendsAuthorized
    },
    songRequest: ''
  });

  const [errors, setErrors] = useState<{ fullName?: string; attendance?: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filter events based on isFriendsAuthorized
  const availableEventsForRsvp = weddingEvents.filter(
    (event) => !event.isFriendsOnly || isFriendsAuthorized
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, fullName: e.target.value });
    if (e.target.value.trim()) {
      setErrors((prev) => ({ ...prev, fullName: undefined }));
    }
  };

  const handleAttendanceSelect = (option: AttendanceOption) => {
    setFormData({ ...formData, attendance: option });
    setErrors((prev) => ({ ...prev, attendance: undefined }));
  };

  const handleEventToggle = (eventId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedEvents: {
        ...prev.selectedEvents,
        [eventId]: !prev.selectedEvents[eventId]
      }
    }));
  };

  const validateStep1 = () => {
    const tempErrors: { fullName?: string } = {};
    if (!formData.fullName.trim()) {
      tempErrors.fullName = 'Please enter your full name(s) so we can locate you.';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateStep2 = () => {
    const tempErrors: { attendance?: string } = {};
    if (!formData.attendance) {
      tempErrors.attendance = 'Please select your attendance status.';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      // If sadly can't make it, we skip the specific events step and jump straight to song request / submit notes!
      if (formData.attendance === 'NO') {
        setStep(4);
      } else {
        setStep(3); // Go to Event selecting checklist
      }
    } else if (step === 3) {
      setStep(4);
    }
  };

  const prevStep = () => {
    if (step === 4 && formData.attendance === 'NO') {
      setStep(2);
    } else {
      setStep((p) => p - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const rsvpRef = doc(collection(db, 'rsvps'));
      const payload = {
        fullName: formData.fullName.trim(),
        attendance: formData.attendance,
        selectedEvents: formData.selectedEvents,
        songRequest: formData.songRequest.trim() || '',
        createdAt: serverTimestamp(),
      };

      await setDoc(rsvpRef, payload);

      // Save to local parent states so they sync
      onSubmitMock(formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Firestore RSVP submission failed:", error);
      setSubmitError(error instanceof Error ? error.message : "An unexpected server-side error occurred.");
      handleFirestoreError(error, OperationType.CREATE, 'rsvps');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Beautiful rephrased attendance options description text maps with traditional accents
  const attendanceOptions: { id: AttendanceOption; title: string; subtitle: string }[] = [
    {
      id: 'YES',
      title: "Count me in! Padharo Mhare Des",
      subtitle: "Wouldn't miss it for the world. Excelling to be there!"
    },
    {
      id: 'VISA',
      title: "Counting down the days (Visa Pending)",
      subtitle: "Will absolutely be there the second my visa permits!"
    },
    {
      id: 'NO',
      title: "Sending love from afar",
      subtitle: "Sadly can't make it to Bikaner, but celebrating in spirit."
    }
  ];

  return (
    <section id="rsvp-section" className="py-24 px-4 bg-[#fbf9f4] border-y border-stone-warm bg-jaali-rose bg-[size:32px_32px] select-none">
      <div className="max-w-xl mx-auto">
        
        {/* Editorial Subtitle/Title */}
        <div className="text-center mb-12">
          <span className="font-serif italic text-lg sm:text-xl text-clay-rose block mb-2">
            Aavedan Patra
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-stone-dark tracking-tight mb-3 uppercase">
            Will You Join Us?
          </h2>
          <p className="text-xs sm:text-sm font-sans font-light tracking-wide text-stone-muted max-w-sm mx-auto">
            Please submit your response by October 1st, 2026. This helps us ensure grand arrangements at our palace venue.
          </p>
        </div>

        {/* Main interactive card container */}
        <div className="bg-[#faf8f4]/95 border-2 border-sand-gold/40 rounded-3xl p-6 sm:p-10 shadow-[0_8px_32px_rgba(190,83,60,0.04)] overflow-hidden relative min-h-[380px] flex flex-col justify-between">
          
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
                  {/* Step Indicators */}
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-warm/50 text-xs text-stone-muted font-sans">
                    <span className="uppercase tracking-wider font-semibold text-clay-rose">
                      {step === 1 && "Guest Lookup"}
                      {step === 2 && "Attendance Status"}
                      {step === 3 && "Ceremony Attendance"}
                      {step === 4 && "Musical Anthem"}
                    </span>
                    <span className="font-mono text-xs font-semibold text-sand-gold">
                      Step {step === 4 && formData.attendance === 'NO' ? 3 : step} of {formData.attendance === 'NO' ? 3 : 4}
                    </span>
                  </div>

                  {/* FORM STEPS CONTENT */}
                  {step === 1 && (
                    <div className="space-y-6 animate-gold-border pb-4">
                      <div className="space-y-2">
                        <label htmlFor="full-name" className="block font-serif italic text-lg sm:text-xl text-stone-dark">
                          Who are we celebrating with?
                        </label>
                        <p className="text-xs font-sans text-stone-muted font-light leading-relaxed">
                          Please enter your first and last name. For couples, enter both names separated by &amp; (e.g., Muskaan &amp; Tanishq).
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
                            placeholder="e.g. Jane Smith &amp; Partner"
                            className="bg-[#faf8f4] focus:bg-white w-full pl-10 pr-4 py-4 rounded-xl border border-stone-warm text-sm text-stone-dark placeholder-stone-muted/50 focus:border-clay-rose focus:ring-1 focus:ring-clay-rose outline-none transition-all font-sans font-light"
                          />
                        </div>
                        {errors.fullName && (
                          <p className="text-xs font-sans text-clay-rose font-semibold mt-1">{errors.fullName}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
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
                            className={`cursor-pointer w-full text-left p-5 rounded-2xl border transition-all duration-300 relative flex items-start gap-4 ${
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
                              <p className="text-xs sm:text-sm font-sans font-semibold text-stone-dark">
                                {option.title}
                              </p>
                              <p className="text-xs font-sans font-light text-stone-muted mt-1 leading-relaxed">
                                {option.subtitle}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {errors.attendance && (
                        <p className="text-xs font-sans text-clay-rose font-semibold mt-1">{errors.attendance}</p>
                      )}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <h3 className="font-serif italic text-lg sm:text-xl text-stone-dark mb-2">
                        Select the ceremonies you will attend
                      </h3>
                      <p className="text-xs font-sans text-stone-muted font-light mb-4 leading-relaxed">
                        This allows us to coordinate grand Bikaneri courtyard seating arrangements, local catering, and travel transfers properly.
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
                                isChecked
                                  ? 'border-clay-rose bg-orange-50/20 shadow-sm'
                                  : 'border-stone-warm/80 hover:border-clay-rose/40'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="text-xs sm:text-sm font-sans font-semibold text-stone-dark flex items-center gap-2">
                                  {event.name}
                                  {event.isFriendsOnly && (
                                    <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-sand-gold border border-sand-gold/30 font-bold">
                                      Crew
                                    </span>
                                  )}
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

                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="song-request" className="block font-serif italic text-lg sm:text-xl text-stone-dark leading-relaxed">
                          Which traditional beat or Bollywood dance tracks would keep you on the sangeet floor?
                        </label>
                        <p className="text-xs font-sans text-stone-muted font-light leading-relaxed">
                          Our royal sangeet DJ is compiling our guests' favorite foot-tapping tracks. Share your suggestions below (optional).
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
                            placeholder="Song Title, Album or Artist"
                            className="bg-[#faf8f4] focus:bg-white w-full pl-10 pr-4 py-4 rounded-xl border border-stone-warm text-sm text-stone-dark placeholder-stone-muted/50 focus:border-clay-rose focus:ring-1 focus:ring-clay-rose outline-none transition-all font-sans font-light"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Back / Next buttons */}
                {submitError && (
                  <p className="text-xs font-sans text-clay-rose font-semibold bg-red-50/50 p-3 rounded-xl border border-clay-rose/20 text-center mt-4">
                    Error sending RSVP: {submitError}
                  </p>
                )}

                <div className="flex items-center justify-between gap-4 mt-10 pt-4 border-t border-stone-warm/50">
                  {step > 1 ? (
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

                  {step < 4 && !(step === 2 && formData.attendance === 'NO') ? (
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
                        <>
                          Sending...
                          <Loader2 className="w-3.5 h-3.5 text-white animate-spin shrink-0" />
                        </>
                      ) : (
                        <>
                          Submit Response
                          <Send className="w-3.5 h-3.5 text-white shrink-0" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              // Success Message
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

                <h3 className="font-display text-2xl font-bold text-stone-dark uppercase tracking-wide">
                  Dhanyavaad
                </h3>
                <p className="font-serif italic text-lg text-stone-muted mb-6">
                  {formData.fullName}
                </p>

                <div className="w-12 h-[1px] bg-sand-gold/50 mb-6"></div>

                <div className="space-y-4 w-full text-left bg-white p-6 rounded-2xl border border-stone-warm text-xs font-sans text-stone-dark leading-relaxed mb-6">
                  <p className="font-bold text-clay-rose border-b border-stone-warm/50 pb-2 mb-2 uppercase tracking-wide text-[10px]">
                    Response Summary:
                  </p>
                  <p>
                    <span className="text-stone-muted font-light">Attendance: </span>
                    <strong className="text-stone-dark font-semibold">
                      {formData.attendance === 'YES' && "Attending! (Padharo Mhare Des)"}
                      {formData.attendance === 'VISA' && "Attending, Pending Visa Clearance"}
                      {formData.attendance === 'NO' && "Declined (Joyfully celebrating from afar)"}
                    </strong>
                  </p>
                  
                  {formData.attendance !== 'NO' && (
                    <p>
                      <span className="text-stone-muted font-light">Ceremonies: </span>
                      <strong className="text-stone-dark font-semibold">
                        {Object.entries(formData.selectedEvents)
                          .filter(([_, checked]) => checked)
                          .map(([id]) => weddingEvents.find(e => e.id === id)?.name || id)
                          .join(', ') || 'No specific ceremonies ticked'}
                      </strong>
                    </p>
                  )}

                  {formData.songRequest && (
                    <p>
                      <span className="text-stone-muted font-light">Sangeet Song: </span>
                      <span className="italic text-clay-rose font-medium">"{formData.songRequest}"</span>
                    </p>
                  )}
                </div>

                <p className="text-xs font-sans text-stone-muted font-light italic max-w-xs leading-relaxed">
                  Your response has been saved securely to our Firebase Wedding Database. The royal hosts have been informed of your preference. We cannot wait to celebrate with you!
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setStep(1);
                    setFormData({
                      fullName: '',
                      attendance: null,
                      selectedEvents: {
                        haldi: true,
                        sangeet: true,
                        wedding: true,
                        friendshang: isFriendsAuthorized
                      },
                      songRequest: ''
                    });
                  }}
                  className="cursor-pointer text-xs font-sans text-clay-rose font-bold underline hover:text-clay-dark mt-8 transition-colors uppercase tracking-wider"
                >
                  Submit Another RSVP Response
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
