import numpy as np, wave, sys
SR=44100; D=65.8; out=np.zeros(int(SR*D))
rng=np.random.default_rng(3)
def add(sig,t,g):
    i=int(t*SR); n=min(len(sig),len(out)-i); out[i:i+n]+=sig[:n]*g
def tap():
    n=int(.09*SR); tt=np.arange(n)/SR
    return np.sin(2*np.pi*(900-3000*tt)*tt)*np.exp(-tt*55)
def key():
    n=int(.03*SR); tt=np.arange(n)/SR
    return (rng.standard_normal(n)*0.6+np.sin(2*np.pi*2400*tt))*np.exp(-tt*180)
def whoosh():
    n=int(.35*SR); tt=np.arange(n)/SR; w=rng.standard_normal(n)
    w=np.convolve(w,np.ones(25)/25,'same'); env=np.sin(np.pi*tt/.35)**2
    return w*env
for t in [7.3,8.3,9.95,15.4,19.4,19.9,20.6,24.9]: add(tap(),t,0.35)
for a,b,cps in [(8.6,9.87,15),(10.3,11.57,15),(32.5,33.9,22),(37.6,38.85,20),(39.0,40.6,20),(43.4,44.75,34),(45.0,45.95,20),(47.9,48.5,10),(49.7,52.85,18)]:
    t=a
    while t<b: add(key(),t+rng.uniform(-.01,.01),0.10); t+=1/cps
for t in [4.6,8.1,14.55,18.65,22.85,26.25,32.2,37.2,43.2,47.1,55.6,62.2]: add(whoosh(),t-.12,0.10)
pcm=(np.clip(out,-1,1)*32767).astype(np.int16)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
