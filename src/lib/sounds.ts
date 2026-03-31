// UI Sound Effects using Web Audio API
const audioContext = typeof window !== "undefined" ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.08) {
  if (!audioContext) return;
  if ((window as any).__adminSoundEnabled === false) return;
  // Resume context if suspended (browser autoplay policy)
  if (audioContext.state === "suspended") audioContext.resume();

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

export const sounds = {
  click: () => playTone(800, 0.08, "sine", 0.06),
  tabSwitch: () => {
    playTone(600, 0.06, "sine", 0.05);
    setTimeout(() => playTone(900, 0.08, "sine", 0.05), 50);
  },
  hover: () => playTone(1200, 0.04, "sine", 0.03),
  success: () => {
    playTone(523, 0.12, "sine", 0.06);
    setTimeout(() => playTone(659, 0.12, "sine", 0.06), 100);
    setTimeout(() => playTone(784, 0.15, "sine", 0.06), 200);
  },
  submit: () => {
    playTone(440, 0.1, "triangle", 0.07);
    setTimeout(() => playTone(660, 0.15, "triangle", 0.07), 80);
  },
  refresh: () => playTone(1000, 0.06, "square", 0.03),
  approvalNeeded: () => {
    playTone(440, 0.15, "sine", 0.08);
    setTimeout(() => playTone(550, 0.15, "sine", 0.08), 150);
    setTimeout(() => playTone(660, 0.15, "sine", 0.08), 300);
    setTimeout(() => playTone(880, 0.25, "sine", 0.09), 450);
  },
  nafathLogin: () => {
    // Distinctive double-chime for Nafath login stage
    playTone(523, 0.12, "sine", 0.09);
    setTimeout(() => playTone(784, 0.12, "sine", 0.09), 120);
    setTimeout(() => playTone(1047, 0.18, "sine", 0.1), 240);
    setTimeout(() => playTone(784, 0.12, "sine", 0.08), 420);
    setTimeout(() => playTone(1047, 0.25, "sine", 0.1), 540);
  },
  phoneOtp: () => {
    // Urgent triple-beep for phone OTP stage
    playTone(698, 0.1, "triangle", 0.09);
    setTimeout(() => playTone(880, 0.1, "triangle", 0.09), 130);
    setTimeout(() => playTone(1175, 0.15, "triangle", 0.1), 260);
    setTimeout(() => playTone(880, 0.1, "triangle", 0.08), 420);
    setTimeout(() => playTone(1175, 0.2, "sine", 0.1), 550);
  },
  stcCall: () => {
    // Alert-style rising tone for STC call stage
    playTone(392, 0.12, "square", 0.07);
    setTimeout(() => playTone(523, 0.12, "square", 0.07), 150);
    setTimeout(() => playTone(659, 0.15, "sine", 0.09), 300);
    setTimeout(() => playTone(784, 0.2, "sine", 0.1), 450);
  },
  nafathVerify: () => {
    playTone(587, 0.12, "sine", 0.08);
    setTimeout(() => playTone(740, 0.12, "sine", 0.08), 140);
    setTimeout(() => playTone(880, 0.15, "sine", 0.09), 280);
    setTimeout(() => playTone(1175, 0.12, "sine", 0.09), 420);
    setTimeout(() => playTone(1397, 0.25, "triangle", 0.1), 560);
  },
  warning: () => {
    playTone(880, 0.1, "square", 0.07);
    setTimeout(() => playTone(660, 0.12, "square", 0.07), 120);
    setTimeout(() => playTone(880, 0.1, "square", 0.07), 240);
  },
  chatMessage: () => {
    // Soft bubble pop for incoming chat message
    playTone(1200, 0.06, "sine", 0.07);
    setTimeout(() => playTone(1500, 0.08, "sine", 0.08), 80);
    setTimeout(() => playTone(1800, 0.06, "sine", 0.06), 160);
  },
  payment: () => {
    // Cash register / card swipe sound for payment stage
    playTone(330, 0.08, "square", 0.07);
    setTimeout(() => playTone(440, 0.08, "square", 0.07), 100);
    setTimeout(() => playTone(554, 0.1, "sine", 0.08), 200);
    setTimeout(() => playTone(659, 0.12, "sine", 0.09), 300);
    setTimeout(() => playTone(880, 0.2, "triangle", 0.1), 420);
  },
  cardOtp: () => {
    // Quick alert beeps for card OTP verification
    playTone(988, 0.08, "sine", 0.08);
    setTimeout(() => playTone(1175, 0.08, "sine", 0.08), 100);
    setTimeout(() => playTone(988, 0.08, "sine", 0.07), 250);
    setTimeout(() => playTone(1175, 0.08, "sine", 0.08), 350);
    setTimeout(() => playTone(1397, 0.15, "triangle", 0.09), 480);
  },
  phoneVerification: () => {
    // Ringing phone tone for phone verification
    playTone(440, 0.15, "sine", 0.07);
    setTimeout(() => playTone(480, 0.15, "sine", 0.07), 200);
    setTimeout(() => playTone(440, 0.15, "sine", 0.07), 500);
    setTimeout(() => playTone(480, 0.15, "sine", 0.07), 700);
  },
  liveFeedAlert: () => {
    playTone(1046, 0.08, "sine", 0.06);
    setTimeout(() => playTone(1318, 0.1, "sine", 0.07), 100);
  },
  feedNewVisitor: () => {
    // Welcoming ascending chime
    playTone(659, 0.1, "sine", 0.07);
    setTimeout(() => playTone(880, 0.1, "sine", 0.07), 110);
    setTimeout(() => playTone(1175, 0.12, "sine", 0.06), 220);
  },
  feedNavigation: () => {
    // Soft subtle swoosh
    playTone(900, 0.06, "triangle", 0.04);
    setTimeout(() => playTone(1100, 0.06, "triangle", 0.04), 70);
  },
  feedAction: () => {
    // Short attention pulse
    playTone(784, 0.08, "square", 0.05);
    setTimeout(() => playTone(1047, 0.1, "sine", 0.06), 100);
    setTimeout(() => playTone(784, 0.06, "sine", 0.04), 200);
  },
};
