import re, json, subprocess, sys
script = """Pernah dengar emas WARIS Sampoerna? |
Ini emas batangan dari PT Sampoerna Gold Indonesia, kadarnya sembilan ratus sembilan puluh sembilan koma sembilan. Pertama kali hadir tahun dua ribu sembilan belas, dan sekarang tersedia dari setengah gram sampai seratus gram. |
Gimana cara tahu emasnya asli? Tiap kemasan punya QR code unik yang bisa kamu pindai, ditambah label void dan hologram pengaman. |
Sekarang, cara belinya lewat website. Buka sampoernagold dot com. |
Kalau belum punya akun, klik Registrasi dulu. Kalau sudah, tinggal login pakai email dan password. |
Cek harga emas hari ini, lalu pilih gramasi yang kamu mau. |
Klik Keranjang atau Beli Sekarang, isi data pengiriman, lalu selesaikan pembayarannya. |
Invoice dan nomor resi dikirim lewat email. Pesanan yang masuk sebelum jam satu siang dikirim di hari yang sama, kecuali Sabtu, Minggu, dan hari libur. |
Nah, sebelum beli, pahami dulu yang namanya spread. |
Spread itu selisih antara harga jual dan harga buyback. |
Contohnya, per tujuh November dua ribu dua puluh enam, emas satu gram dijual dua juta lima ratus tujuh ribu rupiah. Harga buyback-nya dua juta tiga ratus delapan puluh ribu. Selisihnya seratus dua puluh tujuh ribu, sekitar lima persen. |
Makin besar gramasinya, persentase spread-nya makin kecil. Sepuluh gram sekitar tiga koma delapan persen, seratus gram sekitar tiga koma tujuh persen. |
Artinya, harga emas perlu naik melewati spread dulu sebelum kamu untung. Jadi emas lebih cocok untuk simpanan jangka panjang. |
Lebih suka beli langsung? Ada dua toko offline. |
Di Jakarta, Sampoerna Strategic Square, North Tower, lantai LG nomor dua belas, Jalan Jenderal Sudirman. |
Dan di Surabaya, BG Junction Mall, lantai G unit B tujuh puluh tujuh A, Jalan Bubutan. |
Harga emas bisa berubah setiap hari, jadi selalu cek harga terbarunya di website resmi sebelum membeli. |"""
OV={'pt':2,'qr':3,'code':1,'void':1,'website':2,'login':2,'email':2,'password':2,'spread':1,'spread-nya':2,'buyback':2,'buyback-nya':3,'offline':2,'invoice':2,'strategic':3,'square':1,'north':1,'tower':2,'junction':2,'mall':1,'gold':1,'lg':2,'bg':2,'g':1,'b':1,'a':1,'sampoernagold':5,'dot':1,'com':1,'waris':2}
def syl(w):
    w=w.lower().strip('.,?!')
    if w in OV: return OV[w]
    return max(1,len(re.findall(r'(ai|au|oi|[aeiou])',w)))
words=[]; para=0
for tok in script.split():
    if tok=='|': para+=1; continue
    words.append(dict(w=tok,s=syl(tok),p=para,brk=tok[-1] in '.,?!'))
out=subprocess.run(['python3','-I',sys.argv[1],sys.argv[2],'--noise','-30','--min-pause','0.15'],capture_output=True,text=True).stdout
ph=[tuple(map(float,m)) for m in re.findall(r'frasa \d+: ([\d.]+) - ([\d.]+)',out)]
P,Wn=len(ph),len(words)
S=[0]
for w in words: S.append(S[-1]+w['s'])
rate=sum(b-a for a,b in ph)/S[-1]
INF=1e18
dp=[[INF]*(Wn+1) for _ in range(P+1)]; bk=[[0]*(Wn+1) for _ in range(P+1)]
dp[0][0]=0
for i in range(1,P+1):
    d=ph[i-1][1]-ph[i-1][0]
    for j in range(1,Wn+1):
        best=INF;arg=0
        for k in range(max(0,j-25),j):
            if dp[i-1][k]>=INF: continue
            c=(d-(S[j]-S[k])*rate)**2
            # reward phrase ending at punctuation
            if not words[j-1]['brk']: c+=0.25
            v=dp[i-1][k]+c
            if v<best: best=v;arg=k
        dp[i][j]=best;bk[i][j]=arg
j=Wn;seg=[]
for i in range(P,0,-1):
    k=bk[i][j];seg.append((k,j));j=k
seg.reverse()
res=[]
for (k,j),(a,b) in zip(seg,ph):
    tot=S[j]-S[k];t=a
    for idx in range(k,j):
        dur=(b-a)*words[idx]['s']/tot
        words[idx]['t0']=round(t,2);t+=dur;words[idx]['t1']=round(t,2)
    print(f"{a:6.2f}-{b:6.2f} | "+' '.join(words[x]['w'] for x in range(k,j)))
json.dump(words,open('words.json','w'),ensure_ascii=False)
