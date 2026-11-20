import json, sys
from faster_whisper import WhisperModel
import wave, numpy as np
wf = wave.open(sys.argv[1]); audio = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
m = WhisperModel(sys.argv[2], device="cpu", compute_type="int8", cpu_threads=4)
segs, info = m.transcribe(audio, language="fa", word_timestamps=True, vad_filter=False, beam_size=5,
    initial_prompt="پتروف، اوکو، سرپوخوف، مالمستروم، مونتانا، ریگان، کا‌گ‌ب، ۱۹۸۳")
out = []
for s in segs:
    for w in s.words: out.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)})
    print(round(s.end,1), s.text[:60], flush=True)
json.dump(out, open(sys.argv[3], "w"), ensure_ascii=False)
