export interface VoiceOption {
  id: string;
  name: string;
  gender: 'Female' | 'Male' | 'Neutral';
  timbre: string;
  description: string;
  tags: string[];
}

export interface StylePreset {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
  iconName: string;
}

export const VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Female',
    timbre: 'Warm & Soothing',
    description: 'Natural, calming, and melodious with clear articulation. Perfect for narrations, stories, and meditation.',
    tags: ['Warm', 'Clear', 'Narrative', 'Calm']
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Male',
    timbre: 'Youthful & Dynamic',
    description: 'Energetic, approachable, and engaging. Great for casual podcasts, dialogue, and tech explainers.',
    tags: ['Youthful', 'Dynamic', 'Friendly', 'Casual']
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Neutral',
    timbre: 'Bright & Crisp',
    description: 'Modern, articulate, and highly intelligible. Ideal for news briefings, business announcements, and tutorials.',
    tags: ['Crisp', 'Modern', 'Professional', 'Bright']
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Male',
    timbre: 'Deep & Resonant',
    description: 'Authoritative, gravitas-filled, and steady. Excellent for documentary narration, dramatic fiction, and trailers.',
    tags: ['Deep', 'Authoritative', 'Dramatic', 'Rich']
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Male',
    timbre: 'Commanding & Bold',
    description: 'Strong, powerful, and expressive with weight. Suited for cinematic reads, bold storytelling, and impactful speeches.',
    tags: ['Commanding', 'Strong', 'Cinematic', 'Bold']
  }
];

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'news-anchor',
    title: 'News Broadcaster',
    category: 'Broadcast',
    description: 'Professional, articulate, and neutral delivery like an international news anchor.',
    prompt: 'Clear, articulate, neutral professional news anchor delivery with steady cadence.',
    iconName: 'Radio'
  },
  {
    id: 'conversational-podcast',
    title: 'Casual Podcast Host',
    category: 'Casual',
    description: 'Friendly, warm, and natural conversational cadence with spontaneous inflection.',
    prompt: 'Warm, engaging, relaxed conversational podcast host tone with natural inflection.',
    iconName: 'Mic'
  },
  {
    id: 'dramatic-audiobook',
    title: 'Cinematic Storyteller',
    category: 'Dramatic',
    description: 'Expressive and immersive storytelling with dynamic emphasis and emotional depth.',
    prompt: 'Immersive, expressive dramatic audiobook narrator with evocative pacing and rich emotional cadence.',
    iconName: 'BookOpen'
  },
  {
    id: 'meditation-calm',
    title: 'Mindfulness & Meditation',
    category: 'Soothing',
    description: 'Tranquil, unhurried, gentle, and peaceful tone designed to relax the listener.',
    prompt: 'Soft, soothing, slow-paced meditation guide with gentle breathy pauses and calming presence.',
    iconName: 'Sparkles'
  },
  {
    id: 'tech-keynote',
    title: 'Enthusiastic Keynote',
    category: 'Energetic',
    description: 'Inspiring, upbeat, and visionary presentation tone for product launches.',
    prompt: 'Enthusiastic, visionary, inspiring tech keynote speaker with energetic cadence and confident emphasis.',
    iconName: 'Zap'
  },
  {
    id: 'bedtime-story',
    title: 'Warm Bedtime Story',
    category: 'Soothing',
    description: 'Tender, comforting, soft, and gentle pacing for nighttime tales.',
    prompt: 'Tender, comforting, gentle bedtime storyteller with soft melodious cadence.',
    iconName: 'Moon'
  },
  {
    id: 'documentary-history',
    title: 'Documentary Historian',
    category: 'Informative',
    description: 'Thoughtful, curious, and articulate narration typical of nature or history films.',
    prompt: 'Thoughtful, articulate, documentary narrator with deliberate contemplation and refined diction.',
    iconName: 'Compass'
  },
  {
    id: 'fast-announcer',
    title: 'Brisk Commercial',
    category: 'High-Tempo',
    description: 'Snappy, punchy, and upbeat announcement pacing.',
    prompt: 'Brisk, punchy, upbeat commercial delivery with crisp consonants and high energy.',
    iconName: 'FastForward'
  }
];

export const SAMPLE_TEXTS = [
  {
    title: '🎙️ Tech Keynote',
    category: 'Product Launch',
    voice: 'Zephyr',
    styleId: 'tech-keynote',
    text: `Good morning, everyone! Today, we are thrilled to introduce a groundbreaking leap forward in acoustic intelligence. Gemini VoiceStudio turns your written thoughts into lifelike, emotionally nuanced speech that sounds indistinguishable from human expression. Every nuance, every cadence, and every breath is rendered with stunning fidelity.`
  },
  {
    title: '🌧️ Mystery Audiobook',
    category: 'Storytelling',
    voice: 'Charon',
    styleId: 'dramatic-audiobook',
    text: `The rain continued its relentless descent upon the cobblestones of Victorian London. Inside the dimly lit study, detective Vance picked up the tarnished silver pocket watch. It had stopped precisely at twelve minutes past three... <breath> and on the interior casing, a single word had been freshly carved: "Tomorrow."`
  },
  {
    title: '🌿 Guided Mindfulness',
    category: 'Wellness',
    voice: 'Kore',
    styleId: 'meditation-calm',
    text: `Close your eyes gently, and allow your shoulders to drop away from your ears. Take a deep, effortless breath in... filling your lungs with fresh stillness... and slowly release it out. With every breath, let go of the day's rush. You are right here, fully present and completely at peace.`
  },
  {
    title: '📰 Global News Flash',
    category: 'News',
    voice: 'Puck',
    styleId: 'news-anchor',
    text: `From our global newsroom: Astronomers at the Mauna Kea observatory have detected an unexpected atmospheric signal from an exoplanet located forty light-years away. Initial telemetry points toward unprecedented atmospheric water vapor, opening new avenues in planetary research.`
  },
  {
    title: '☕ Friendly Podcast',
    category: 'Conversation',
    voice: 'Puck',
    styleId: 'conversational-podcast',
    text: `Welcome back to the show! So earlier this morning, I was chatting with a good friend about generative audio, and |yeah| we started wondering: what happens when machines don't just speak words, but actually understand the emotion behind them? <laugh> It turns out, we might already be living in that future.`
  }
];

export const VOCAL_TAGS = [
  { tag: '<breath>', label: 'Breath', description: 'Insert natural audible inhalation' },
  { tag: '<laugh>', label: 'Laugh', description: 'Insert a light chuckling/laugh sound' },
  { tag: '<gasp>', label: 'Gasp', description: 'Insert an expressive gasp or surprise' },
  { tag: '|yeah|', label: 'Backchannel (yeah)', description: 'Insert conversational acknowledgment' },
  { tag: '|mhm|', label: 'Backchannel (mhm)', description: 'Insert agreement murmur' },
  { tag: '... ', label: 'Natural Pause', description: 'Insert deliberate rhythmic pause' }
];
