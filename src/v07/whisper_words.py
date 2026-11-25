# Word timing for the 16 narration files with faster-whisper (cloud, CPU). Writes uploads/v07/narration/timing/v07-NN.json in the
# same shape as whisper.cpp's -ojf output that align.py reads: { transcription: [ { text, offsets: { from, to } (ms) } ] }.
# Usage: python src/v07/whisper_words.py [model=large-v3] [n1 n2 ...]   (skips files that already have a json)
import sys, os, json
from faster_whisper import WhisperModel
os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/../..')
model = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].isdigit() else 'large-v3'
nums = [int(x) for x in sys.argv[1:] if x.isdigit()] or list(range(1, 17))
os.makedirs('uploads/v07/narration/timing', exist_ok=True)
m = WhisperModel(model, device='cpu', compute_type='int8', cpu_threads=4)
for n in nums:
    out = f'uploads/v07/narration/timing/v07-{n:02d}.json'
    if os.path.exists(out): continue
    segs, _ = m.transcribe(f'uploads/v07/narration/v07-{n:02d}.mp3', language='fa', word_timestamps=True, vad_filter=False, beam_size=5)
    tr = []
    for s in segs:
        for w in (s.words or []):
            tr.append({'text': w.word.strip(), 'offsets': {'from': int(w.start * 1000), 'to': int(w.end * 1000)}})
    json.dump({'transcription': tr}, open(out, 'w', encoding='utf8'), ensure_ascii=False)
    print('done', n, len(tr), 'words', flush=True)
