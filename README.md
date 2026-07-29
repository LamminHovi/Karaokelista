# poy / 29.7.2026 n. klo 06:38
README.md tämä tdsto 
    Päivitetty:
        
# Karaokelista
Karaokekappale listau HOVI

## Käyttö verkossa
Osoite mistä ko ohjelma tai näyttö aukeaa:
Avaa sivu:
https://lamminhovi.github.io/Karaokelista/
Osoite missä muokataan sivuja (github):
https://github.com/LamminHovi/Karaokelista 

# Karaoke kappale haku HOVI
MITÄ SIVUT SISÄLTÄÄ:
Tämä on Lamminhovin karaokekappaleiden haku- ja selausjärjestelmä.
Sivulla voi hakea artisteja, kappaleita, koneita ja koodeja.
- - - - - - - - - -

### Ohjeita scriptin sisällä: html
Jos haluat blokata rivin, alkuun <!-- ja loppuun <--
<!-- ölskfaljsk koodi föasfö --> tämän rivi koodia ei suoriteta
eli vielä:
<!-- <h2>📄 Näkymän sisältö</h2> -->

useampi rivi pois:
<!--
<h2>📄 Näkymän sisältö</h2>
<p>Tämä teksti ei näy sivulla.</p>
-->

iso osa:
<!--
<div class="section">
    <h2>📄 Näkymän sisältö</h2>
    <p>...</p>
</div>
-->

## Tiedostot
- help.docx - alkuperäinen help tiedosto

- README.md - tämä tdsto.

- artisti.csv    päivittyy erillisellä Kappaleen lisäys näytöltä (jos uusi artisti, eikä löydy artisti.csv tdstosta.
  Toimii lasvetovalikkona lisaa_uusi_local.html näytölle.

- help.html — ohjesivu index.html varsinaisella kappale selausn näytöllä on nappi Help joka avaa tämän help.html

- index.html — varsinainen karaokelista ja hakutoiminnot

- kappaleet.csv — karaokekappaleiden lista joka myös päivittyy erillisen Kappale Lisäy -näytön kautta tai muokkaamalla
  tätä kappaleet.csv tidostoa. Toimii lasvetovalikkona lisaa_uusi_local.html näytölle.

- koodi.csv - tiedosto koodeeista, alasvetovalikkona lisaa_uusi_local.html näytölle.

- lisaa_uusi.html - alunperin oli tarkoitus käyttää tätä näyttöä Kappaleiden lisäys, muutos tai poisto työkaluna
  mutta on päädytty käyttämään paikallista (vaatii TOKEN) lisaa_uusi_local.html tidostoa joka on
  C:\KappAppNet\lisaa_uusi_local.html
  ## Ominaisuudet
- Haku kaikista sarakkeista
- Aakkosnapit A–Ö
- Tumma / vaalea teema
- Lajittelu sarakkeittain
- Päivitysaika GitHubista

![QR-koodi]QR-koodi Hovin Karaokekappaleet.pdf


### Päivityksiä / muutoksia / yms.
    

## index.html (ke 29.7.2026 n. klo 07:00 / poy
<!DOCTYPE html>
<html lang="fi">
<head>
<meta charset="UTF-8">
<title>Karaoke kappale haku HOVI</title>

<style>
body.vaalea { background:#ffffff; color:#000; font-family:Arial, sans-serif; margin:20px; }
body.tumma  { background:#121212; color:#e0e0e0; font-family:Arial, sans-serif; margin:20px; }

#ylapalkki {
    position: sticky;
    top: 0;
    background: inherit;
    padding-bottom: 10px;
    z-index: 20;
}

h2, h3 { margin-bottom: 5px; }

input {
    padding: 10px;
    width: 350px;
    max-width: 100%;
    font-size: 18px;
    box-sizing: border-box;
}
button {
    padding: 6px 12px;
    margin: 4px 4px 0 0;
    font-size: 14px;
    cursor: pointer;
}

#aznav {
    margin-top: 8px;
    margin-bottom: 8px;
}
#aznav button {
    padding: 4px 8px;
    font-size: 13px;
    cursor: pointer;
}

.table-wrapper {
    margin-top: 20px;
    overflow-x: auto;
}

table {
    border-collapse: collapse;
    width: 100%;
    min-width: 480px;
}
th, td {
    border: 1px solid #999;
    padding: 6px 8px;
    font-size: 14px;
}

tbody tr:hover { background: rgba(255,255,0,0.25); }

body.vaalea thead th { background:#eee; color:#000; }
body.tumma  thead th { background:#1f1f1f; color:#fff; }

thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    cursor: pointer;
}

th.sort-asc::after  { content: " ▲"; font-size: 11px; }
th.sort-desc::after { content: " ▼"; font-size: 11px; }

#eiLoytynyt {
    margin-top: 15px;
    font-size: 18px;
    font-weight: bold;
    color: red;
    display: none;
}
</style>

</head>
<body class="vaalea">

<div id="ylapalkki">
    <h2>Karaoke kappale haku HOVI</h2>

    <h3>Haku</h3>
    <input id="haku" oninput="paivitaTaulukko()" placeholder="Hae...">
    <button onclick="paivitaNappi()">NOLLAUS</button>
    <button onclick="vaihdaTeema()" id="teemanappi">Tumma teema</button>
    <button onclick="window.location.href='help.html'">Help</button>
    
    <div id="paivitysaika"></div>

    <h3>Koko lista <span id="kokolistaMaara"></span></h3>

    <!-- AAKKOSFILTTERI -->
    <div id="aznav"></div>
</div>

<div class="table-wrapper">
<table id="taulukko">
<thead>
<tr>
    <th onclick="jarjesta('ARTISTI')" id="th-artisti">ARTISTI</th>
    <th onclick="jarjesta('KAPPALE')" id="th-kappale">KAPPALE</th>
    <th onclick="jarjesta('KONE')"    id="th-kone">KONE</th>
    <th onclick="jarjesta('KOODI')"   id="th-koodi">KOODI</th>
</tr>
</thead>
<tbody></tbody>
</table>
</div>

<div id="eiLoytynyt">Ei löytynyt</div>

<script>
function koneVari(kone) {
    if (kone === "C") return "#d0f0ff";
    if (kone === "M") return "#e8ffd0";
    if (kone === "K") return "#ffe8d0";
    if (kone === "C_O") return "#fff7b3";
    return "";
}

let data = [];
let currentLetter = "";
let sortKey = "ARTISTI";
let sortDir = "asc";

function paivitaKokoListaMaara(maara) {
    document.getElementById("kokolistaMaara").innerText = maara + " kpl";
}

async function lataaCSV() {
    const url = "https://raw.githubusercontent.com/LamminHovi/Karaokelista/main/kappaleet.csv";
    const res = await fetch(url);
    const txt = await res.text();

    const rows = txt.trim().split("\n").map(r => r.split(",")).filter(r => r.length >= 4);

    data = rows.map((r, idx) => ({
        ARTISTI: r[0],
        KAPPALE: r[1],
        KONE:    r[2],
        KOODI:   r[3],
        artistUpper: r[0].toUpperCase(),
        kappaleUpper: r[1].toUpperCase(),
        koneUpper: (r[2] || "").toUpperCase(),
        koodiUpper: (r[3] || "").toUpperCase(),
        index: idx
    }));

    paivitaTaulukko();
    paivitaKokoListaMaara(data.length);
}

function haeTeksti() {
    return document.getElementById("haku").value.toUpperCase().trim();
}

function valitseKirjain(kirjain) {
    currentLetter = kirjain;
    paivitaTaulukko();
}

function paivitaTaulukko() {
    const haku = haeTeksti();
    const sanat = haku.split(" ").filter(s => s.length > 0);

    const tbody = document.querySelector("#taulukko tbody");
    tbody.innerHTML = "";

    let rivit = data.filter(r => {

        if (currentLetter && !r.artistUpper.startsWith(currentLetter)) return false;

        if (sanat.length > 0) {
            return sanat.every(s =>
                r.artistUpper.includes(s) ||
                r.kappaleUpper.includes(s) ||
                r.koneUpper.includes(s) ||
                r.koodiUpper.includes(s)
            );
        }

        return true;
    });

    rivit.sort((a, b) => {
        let va = (a[sortKey] || "").toUpperCase();
        let vb = (b[sortKey] || "").toUpperCase();
        if (va < vb) return sortDir === "asc" ? -1 : 1;
        if (va > vb) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    let loytyi = false;

    rivit.forEach(r => {
        const tr = document.createElement("tr");

        ["ARTISTI","KAPPALE","KONE","KOODI"].forEach(k => {
            const td = document.createElement("td");
            let teksti = r[k];

            sanat.forEach(s => {
                if (s.length < 2) return; // korostusbugi korjattu
                const regex = new RegExp(s, "gi");
                teksti = teksti.replace(regex, m => `<mark>${m}</mark>`);
            });

            td.innerHTML = teksti;

            if (k === "KONE") td.style.backgroundColor = koneVari(r.KONE);

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
        loytyi = true;
    });

    document.getElementById("eiLoytynyt").style.display = loytyi ? "none" : "block";

    paivitaSortOtsikot();
    paivitaKokoListaMaara(rivit.length);
}

function paivitaNappi() {
    document.getElementById("haku").value = "";
    currentLetter = "";
    paivitaTaulukko();
    paivitaKokoListaMaara(data.length);
}

function vaihdaTeema() {
    const body = document.body;
    const nappi = document.getElementById("teemanappi");

    if (body.classList.contains("tumma")) {
        body.classList.remove("tumma");
        body.classList.add("vaalea");
        nappi.textContent = "Tumma teema";
    } else {
        body.classList.remove("vaalea");
        body.classList.add("tumma");
        nappi.textContent = "Vaalea teema";
    }
}

function jarjesta(uusiKey) {
    if (sortKey === uusiKey) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
    } else {
        sortKey = uusiKey;
        sortDir = "asc";
    }
    paivitaTaulukko();
}

function paivitaSortOtsikot() {
    const keys = ["ARTISTI","KAPPALE","KONE","KOODI"];
    keys.forEach(k => {
        const th = document.getElementById(
            k === "ARTISTI" ? "th-artisti" :
            k === "KAPPALE" ? "th-kappale" :
            k === "KONE"    ? "th-kone"    :
                              "th-koodi"
        );
        th.classList.remove("sort-asc","sort-desc");
        if (k === sortKey) {
            th.classList.add(sortDir === "asc" ? "sort-asc" : "sort-desc");
        }
    });
}

async function haePaivitysaika() {
    const apiUrl = "https://api.github.com/repos/LamminHovi/Karaokelista/commits?path=kappaleet.csv";

    try {
        const res = await fetch(apiUrl);
        const data = await res.json();

        const pvm = new Date(data[0].commit.author.date);

        const paiva = pvm.getDate();
        const kk = pvm.getMonth() + 1;
        const vuosi = pvm.getFullYear();
        const tunnit = pvm.getHours().toString().padStart(2, "0");
        const minuutit = pvm.getMinutes().toString().padStart(2, "0");

        document.getElementById("paivitysaika").innerText =
            `Viimeksi päivitetty -> poy: ${paiva}.${kk}.${vuosi} klo ${tunnit}:${minuutit}`;

    } catch (e) {
        document.getElementById("paivitysaika").innerText = "Virhe päivitysajan haussa";
    }
}

function rakennaAakkosNapit() {
    const kirjaimet = [
        "A","B","C","D","E","F","G","H","I","J","K","L","M",
        "N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
        "Å","Ä","Ö","ALL"
    ];

    const div = document.getElementById("aznav");
    div.innerHTML = "";

    kirjaimet.forEach(k => {
        const btn = document.createElement("button");
        btn.textContent = k;
        btn.onclick = () => valitseKirjain(k === "ALL" ? "" : k);
        div.appendChild(btn);
    });
}

window.onload = () => {
    rakennaAakkosNapit();
    lataaCSV();
    haePaivitysaika();
};
</script>

</body>
</html>


## help.html
<!DOCTYPE html>
<html lang="fi">
<head>
<meta charset="UTF-8">
<title>Help – Karaoke kappale haku HOVI</title>

<style>
    <a class="back" href="index.html">← Takaisin hakuun</a>
body {
    font-family: Arial, sans-serif;
    margin: 20px;
    line-height: 1.6;
    background: #f7f7f7;
    color: #222;
}
h1 {
    font-size: 28px;
    margin-bottom: 10px;
}
h2 {
    margin-top: 30px;
    font-size: 22px;
    border-left: 6px solid #0077cc;
    padding-left: 10px;
}
h3 {
    margin-top: 20px;
    font-size: 18px;
}
.section {
    background: #fff;
    padding: 15px 20px;
    border-radius: 8px;
    margin-top: 15px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.note {
    background: #fff8c6;
    padding: 10px 15px;
    border-left: 5px solid #e6c200;
    margin-top: 10px;
    border-radius: 6px;
}
.code {
    background: #eee;
    padding: 6px 10px;
    border-radius: 4px;
    font-family: Consolas, monospace;
}
ul {
    margin-top: 10px;
}
.back {
    margin-top: 30px;
    display: inline-block;
    padding: 10px 16px;
    background: #0077cc;
    color: #fff;
    border-radius: 6px;
    text-decoration: none;
}
.back:hover {
    background: #005fa3;
}
.float-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #0077cc;
    color: #fff;
    padding: 12px 16px;
    border-radius: 50%;
    text-decoration: none;
    font-size: 18px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}
.float-top:hover {
    background: #005fa3;
}
</style>
</head>

<body>
<a id="top"></a>

<h1>📘 Karaoke kappale haku HOVI – Ohje</h1>
<div class="section">
<h2>🔗 Sivun avaaminen</h2>
<p>Voit avata sivun QR‑koodista tai kirjoittamalla selaimeen osoitteen:</p>

<div class="code">https://lamminhovi.github.io/Karaokelista/</div>

<p><b>Huom:</b> sana <b>Karaokelista</b> pitää olla isolla K‑kirjaimella.</p>
</div>

<div class="section">
<h2>📄 Näkymän sisältö</h2>
<p>Sivulle avautuu oletuksena <b>kaikki Hovin karaokekappaleet</b>.</p>
<p>Yläpuolella näkyy:</p>
<ul>
<li><b>Koko lista xxxxx kpl</b> – rivien määrä</li>
<li>Hakukenttä</li>
<li>NOLLAUS -nappi</li>
<li>Aakkosnapit A–Ö</li>
<li>Teeman vaihto (vaalea / tumma)</li>
<li>Help -nappi</li>
<li>Viimeksi päivitetty ‑aikaleima</li>
</ul>
</div>

<div class="section">
<h2>🔍 Haku</h2>
<p>Kirjoita hakukenttään haettavaa <b>ARTISTIa</b> tai <b>KAPPALEtta</b> (tai <b>(KONE)</b> tai <b>(KOODI))</b>
<ul>
<li><b>ARTISTI</b> Etsittävän artistin nimi tai osa jostain kohtaa nimeä</li>
<li><b>KAPPALE</b> Etsittävän kappaleen nimi tai osa kappaleen nimestä</li>
<li><b>KONE</b>Missä kappaleen tiedosto on (PC on "K", MadBoy on "M", MicroCard on "C")</li>
<li><b>KOODI</b>ns. Tuottajan koodi tai nimi eism. FinnKaraoke on "FIN...", MelPlay on "MEL..." )</li>
</ul>
</div>

<div class="section">
<h2>🔠 Aakkosnapit</h2>
<p>Aakkosnapit A–Ö lyhentävät listaa <b>ARTISTI</b>‑sarakkeen mukaan.</p>
<p>Napista ei voi kirjoittaa, se vain suodattaa listaa.</p>
</div>

<div class="section">
<h2>🧹 Hakukentän tyhjentäminen</h2>

<h3>jos selaat Puhelimella</h3>
<ul>
<li>NOLLAUS ‑napilla</li>
<li>Näppäimistön "<--" ‑painikkeella</li>
<li>Maalaamalla tekstin ja kirjoittamalla päälle</li>
</ul>

<h3>selaus PC:llä, läppärillä, tabletilla...</h3>
<ul>
<li>NOLLAUS‑napilla</li>
<li>Backspace</li>
<li>Delete</li>
<li>Esc</li>
<li>Maalaamalla teksti ja kirjoittamalla päälle</li>
</ul>

<div class="note">NOLLAUS nappi varmin --> uusi haku.</div>
</div>

<div class="section">
<h2>🌙 Teeman vaihto</h2>
<p>Napauttamalla teemanappia tausta muuttuu mustaksi ja tekstit vaaleiksi.</p>
<p>Oletuksena käytössä on <b>Vaalea -teema</b>.</p>
</div>

<div class="section">
<h2>⏱ Viimeksi päivitetty</h2>
<p>Teksti kertoo, milloin kappalelistaan on viimeksi:</p>
<ul>
<li>lisätty -karaokekappale</li>
<li>muutettu -karaokekappaletta</li>
<li>poistettu -karaokekappale</li>
</ul>

<p>(HUOM! Karaokekappaleiden selaus -näytöllä ei pysty
poistamaan tai muuttamaan mitään, joten voit huoletta selailla).</p>
</div>
<h3>Perushaku</h3>
<p>Kirjoita hakukenttään haettavaa <b>ARTISTIa</b> tai <b>KAPPALEtta</b> (tai <b>(KONE)</b> tai <b>(KOODI))</b>.</p>

<p>Haku löytää osumat <b>kaikista sarakkeista</b>.
    Esimerkki:</p>

<div class="code">yöli</div>

<p>Näyttää kaikki rivit, joissa esiintyy sana "yöli" missä tahansa sarakkeessa.</p>

<div class="note">Osumat korostetaan keltaisella.</div>

<h3>Usean sanan haku</h3>
<p>Voit hakea useita sanoja samaan aikaan Esim:</p>

<div class="code">k tapio sinut fin</div>

<p>Löytää:</p>
<div class="code">KARI TAPIO / SINUT TULEN AINA MUISTAMAAN / M / FIN</div>

<h3>Kirjainkoko</h3>
<p>Voit kirjoittaa pienillä tai ISOILLA kirjaimilla – haku ei ole kirjainkokoherkkä.</p>

<h3>Ei löytynyt</h3>
<p>Jos haku ei löydä mitään:</p>
<ul>
<li>Koko lista 0 kpl</li>
<li>Ei löytynyt</li>
</ul>
</div>
<div class="section">
<h2>📊 Rivimäärä</h2>
<p>“Koko lista x kpl” kertoo montako riviä = kappaletta listalla.</p>
<p>Esim. haulla <b>Kari Tapio</b> näkyy:</p>
<div class="code">Koko lista 157 kpl</div>
</div>

<div class="section">
<h2>↕ Sarakkeiden lajittelu</h2>
<p>Kaikki sarakkeet voi lajitella A–Ö tai Ö–A.</p>
<p>Napsauttamalla jotain Saraketta (ARTISTI, KAPPALE, KONE, KOODI) Sarakkeen nimen perään ilmestyy pieni kolmio:</p>
<ul>
<li>▲ = nouseva järjestys</li>
<li>▼ = laskeva järjestys</li>
</ul>
</div>

<div class="section">
<h3>📝 Ohjetta päivitetty</h3>
<p>Su 26.7.2026 n. klo 16:45 (poy)</p>
<p>Ke 29.7.2026 n. klo 05:35 (poy)</p>
</div>

<a href="#top" class="float-top">↑ Ylös</a>    
<a class="back" href="index.html">← Takaisin hakuun</a>

</body>
</html>

# loppu




