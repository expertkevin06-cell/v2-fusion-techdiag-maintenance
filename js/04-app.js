/* ══════════════════════════════════════════════════════════════════════════
   js/04-app.js — MECADATA v8.1
   • Méga-base étendue 2017→2027 : FR / EU / Asie / Chine / US, modèles, phases,
     motorisations, pannes corrélées, rappels, TSB, bulletins.
   • Accès tiers par mot de passe « expert83 » + validation administrateur.
   • Imports / exports / mises à jour massives : administrateur uniquement.
   • Plan d'entretien complet jusqu'à 200 000 km pour chaque sélection.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ═══════════════ MÉGA-BASE : EXTENSION 2017→2027 ═══════════════ */
  (function megaPack() {
    var R = window.MD_RAW; if (!R) return;
    function nk(s) { return String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ""); }
    function slug(s) { return nk(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "x"; }
    var SEGS = R.segs;
    var NEW_BR = [
      "daihatsu|Daihatsu|Japon|Toyota|asie", "isuzu|Isuzu|Japon|Isuzu|asie", "infiniti|Infiniti|Japon|Nissan|asie",
      "acura|Acura|Japon|Honda|asie", "kgm|KGM / SsangYong|Corée du Sud|KG Group|asie",
      "gmc|GMC|États-Unis|GM|amerique", "ram|RAM|États-Unis|Stellantis|amerique", "dodge|Dodge|États-Unis|Stellantis|amerique",
      "chrysler|Chrysler|États-Unis|Stellantis|amerique", "buick|Buick|États-Unis|GM|amerique", "lincoln|Lincoln|États-Unis|Ford|amerique",
      "rivian|Rivian|États-Unis|Rivian|amerique", "lucid|Lucid|États-Unis|Lucid|amerique",
      "bentley|Bentley|Royaume-Uni|VW Group|europe", "rolls|Rolls-Royce|Royaume-Uni|BMW Group|europe",
      "aston|Aston Martin|Royaume-Uni|Aston Martin|europe", "mclaren|McLaren|Royaume-Uni|McLaren|europe",
      "lotus|Lotus|Royaume-Uni|Geely|europe", "ferrari|Ferrari|Italie|Ferrari|europe", "lamborghini|Lamborghini|Italie|VW Group|europe",
      "maserati|Maserati|Italie|Stellantis|europe", "bugatti|Bugatti|France|Bugatti Rimac|europe", "lada|Lada|Russie|AvtoVAZ|europe",
      "hongqi|Hongqi|Chine|FAW|chine", "li|Li Auto|Chine|Li Auto|chine", "denza|Denza|Chine|BYD|chine",
      "yangwang|Yangwang|Chine|BYD|chine", "fangchengbao|Fangchengbao|Chine|BYD|chine", "exeed|Exeed|Chine|Chery|chine",
      "jetour|Jetour|Chine|Chery|chine", "gwm|GWM|Chine|Great Wall|chine", "tank|Tank|Chine|Great Wall|chine",
      "roewe|Roewe|Chine|SAIC|chine", "maxus|Maxus|Chine|SAIC|chine", "wuling|Wuling|Chine|SAIC-GM-Wuling|chine",
      "baojun|Baojun|Chine|SAIC-GM-Wuling|chine", "aiways|Aiways|Chine|Aiways|chine", "seres|Seres|Chine|Seres|chine",
      "aito|AITO|Chine|Seres / Huawei|chine", "avatr|Avatr|Chine|Changan / Huawei|chine", "deepal|Deepal|Chine|Changan|chine",
      "changan|Changan|Chine|Changan|chine", "voyah|Voyah|Chine|Dongfeng|chine", "dongfeng|Dongfeng|Chine|Dongfeng|chine",
      "jac|JAC|Chine|JAC|chine", "jmc|JMC|Chine|JMC|chine", "neta|Neta|Chine|Hozon|chine", "xiaomi|Xiaomi|Chine|Xiaomi|chine"
    ];
    var have = {}; R.br.forEach(function (b) { have[b[0]] = 1; });
    NEW_BR.forEach(function (r) { var f = r.split("|"); if (!have[f[0]]) { R.br.push(f); have[f[0]] = 1; } });

    var NEW_MD = {
      daihatsu: "Sirion^2013^2023^1^1|Terios^2017^2027^3^2|Rocky^2021^2027^3^1|Move^2014^2023^1^6|Tanto^2019^2027^1^4|Mira e:S^2017^2027^1^2",
      isuzu: "D-Max III^2020^2027^13^3|MU-X II^2021^2027^4^2|N-Series^2014^2027^8^6|D-Max II^2012^2020^13^2",
      infiniti: "Q50^2013^2024^5^1|Q60^2016^2022^9^2|QX50^2018^2027^4^2|QX55^2021^2027^4^1|QX60^2021^2027^4^2|QX80^2018^2027^4^3|Q70^2014^2019^5^2",
      acura: "Integra^2023^2027^2^5|TLX^2021^2027^5^2|MDX^2021^2027^4^4|RDX^2019^2027^4^3|ZDX^2024^2027^4^1|NSX^2017^2022^11^2",
      kgm: "Torres^2022^2027^4^1|Torres EVX^2023^2027^4^1|Korando IV^2019^2027^4^4|Rexton II^2017^2027^4^2|Musso^2018^2027^13^1|Tivoli^2015^2027^3^1",
      gmc: "Hummer EV^2022^2027^13^1|Sierra 1500^2019^2027^13^5|Sierra HD^2020^2027^13^4|Yukon^2021^2027^4^5|Terrain^2018^2027^4^3|Acadia^2017^2027^4^3|Canyon^2015^2027^13^2",
      ram: "1500 DT^2019^2027^13^5|1500 REV^2025^2027^13^1|2500 HD^2019^2027^13^4|ProMaster^2014^2027^8^3|1500 Classic^2019^2024^13^4",
      dodge: "Charger VII^2015^2023^5^7|Charger Daytona^2024^2027^5^8|Challenger III^2015^2023^9^3|Durango IV^2014^2027^4^4|Hornet^2023^2027^4^1",
      chrysler: "Pacifica^2017^2027^12^2|300 II^2015^2023^5^2|Voyager^2020^2027^12^6",
      buick: "Enclave II^2018^2027^4^2|Encore GX^2020^2027^3^1|Envision^2016^2027^4^2|Envista^2024^2027^3^1",
      lincoln: "Navigator IV^2018^2027^4^4|Aviator II^2020^2027^4^2|Corsair^2020^2027^4^1|Nautilus^2019^2027^4^2|Zephyr^2022^2027^5^1",
      rivian: "R1T^2022^2027^13^1|R1S^2022^2027^4^1|R2^2026^2027^4^1|R3^2027^2027^3^1",
      lucid: "Air^2022^2027^5^1|Gravity^2025^2027^4^1|Earth^2026^2027^4^1",
      bentley: "Bentayga^2016^2027^4^1|Continental GT III^2018^2027^9^3|Flying Spur^2019^2027^5^3|Batur^2023^2027^9^1|Bacalar^2021^2024^10^1",
      rolls: "Cullinan^2018^2027^4^1|Spectre^2023^2027^9^1|Ghost II^2020^2027^5^2|Phantom VIII^2017^2027^5^8",
      aston: "DBX^2020^2027^4^1|Vantage IV^2018^2027^11^4|DB12^2023^2027^9^3|DB11^2016^2023^9^2|Valhalla^2025^2027^11^1|DBS^2018^2024^11^3|Valour^2023^2024^11^1",
      mclaren: "Artura^2022^2027^11^1|750S^2023^2027^11^1|720S^2017^2023^11^1|GT^2019^2027^9^1|W1^2025^2027^11^1|Senna^2018^2020^11^1|Elva^2021^2024^10^1",
      lotus: "Emira^2022^2027^9^1|Eletre^2023^2027^4^1|Emeya^2024^2027^5^1|Evija^2024^2027^11^1|Exige^2012^2021^11^3|Elise^2012^2021^10^3",
      ferrari: "Roma^2020^2027^9^1|296 GTB^2022^2027^11^1|Purosangue^2023^2027^4^1|SF90^2019^2027^11^1|812^2017^2024^11^1|12Cilindri^2024^2027^9^1|F8^2019^2024^11^1|Portofino^2017^2023^9^1",
      lamborghini: "Urus^2018^2027^4^1|Huracan^2014^2024^11^2|Revuelto^2023^2027^11^1|Temerario^2024^2027^11^1|Aventador^2012^2022^11^2|Sián^2020^2022^11^1",
      maserati: "Grecale^2022^2027^4^1|MC20^2021^2027^11^1|GranTurismo II^2023^2027^9^2|Levante^2016^2024^4^1|Ghibli III^2013^2024^5^3|Quattroporte VI^2013^2023^5^6",
      bugatti: "Chiron^2016^2024^11^1|Tourbillon^2026^2027^11^1|Divo^2019^2021^11^1|Bolide^2024^2027^11^1|Mistral^2024^2027^10^1",
      lada: "Vesta^2015^2027^5^1|Granta^2018^2027^0^2|Niva Travel^2020^2027^4^1|Niva Legend^2014^2027^4^3|Largus^2012^2027^6^2",
      hongqi: "E-HS9^2022^2027^4^1|EH7^2024^2027^5^1|H9^2020^2027^5^1|HS5^2019^2027^4^1|E-HS3^2020^2027^4^1|HS7^2019^2027^4^1",
      li: "L7^2023^2027^4^1|L9^2022^2027^4^1|L8^2022^2027^4^1|L6^2024^2027^4^1|Mega^2024^2027^12^1",
      denza: "Z9 GT^2024^2027^5^1|D9^2023^2027^12^1|N7^2023^2027^4^1|N9^2025^2027^4^1|N8^2023^2027^4^1",
      yangwang: "U8^2023^2027^4^1|U9^2024^2027^11^1|U7^2025^2027^5^1",
      fangchengbao: "Bao 5^2023^2027^4^1|Bao 8^2024^2027^4^1|Tai 3^2025^2027^4^1",
      exeed: "TXL^2021^2027^4^1|VX^2022^2027^4^1|RX^2023^2027^4^1|LX^2021^2027^4^1|ES^2024^2027^5^1|ET^2024^2027^4^1",
      jetour: "Dashing^2022^2027^4^1|X70^2020^2027^4^1|T2^2023^2027^4^1|X90^2021^2027^4^1|Traveller^2023^2027^4^1",
      gwm: "Poer^2020^2027^13^1|Cannon^2021^2027^13^1|Wingle 7^2014^2027^13^5|Ora Cat^2022^2027^0^1",
      tank: "Tank 300^2021^2027^4^1|Tank 500^2022^2027^4^1|Tank 400^2023^2027^4^1|Tank 700^2024^2027^4^1",
      roewe: "RX5 III^2019^2027^4^3|i5^2020^2027^5^1|Marvel R^2021^2027^4^1|D7^2023^2027^5^1|iMAX8^2021^2027^12^1",
      maxus: "E Deliver 9^2021^2027^8^1|T90 EV^2022^2027^13^1|Mifa 9^2022^2027^12^1|Euniq 5^2020^2027^12^1|Deliver 7^2024^2027^8^1|T60^2017^2027^13^1",
      wuling: "Mini EV^2020^2027^1^1|Air EV^2022^2027^1^1|Bingo^2023^2027^0^1|Almaz^2019^2027^4^1|Confero^2017^2027^5^1|Cortez^2017^2027^12^1",
      baojun: "KiWi EV^2021^2027^1^1|Yep^2023^2027^3^1|530^2019^2027^4^1|Cloud^2023^2027^2^1|510^2017^2027^3^1",
      aiways: "U5^2020^2025^4^1|U6^2022^2025^4^1|U7^2024^2027^4^1",
      seres: "Seres 5^2023^2027^4^1|Seres 7^2024^2027^4^1|Seres 3^2022^2027^3^1|Seres 8^2025^2027^4^1",
      aito: "M5^2022^2027^4^1|M7^2023^2027^4^1|M9^2024^2027^4^1|M8^2025^2027^4^1",
      avatr: "Avatr 11^2022^2027^4^1|Avatr 12^2023^2027^5^1|Avatr 07^2024^2027^4^1|Avatr 06^2025^2027^5^1",
      deepal: "S07^2023^2027^4^1|SL03^2022^2027^5^1|S05^2024^2027^4^1|G318^2024^2027^4^1",
      changan: "CS75 Plus^2019^2027^4^2|UNI-K^2021^2027^4^1|UNI-T^2020^2027^4^1|Eado^2019^2027^5^2|CS55 Plus^2018^2027^4^2|Hunter^2021^2027^13^1|CS35 Plus^2018^2027^3^1",
      voyah: "Free^2021^2027^4^1|Dream^2022^2027^12^1|Passion^2023^2027^5^1|Courage^2024^2027^4^1",
      dongfeng: "Box^2024^2027^0^1|Forthing T5^2023^2027^4^1|Aeolus L7^2023^2027^4^1|Rich 6^2021^2027^13^1|U-Tour^2024^2027^12^1|Aeolus Yixuan^2019^2027^5^1",
      jac: "e-JS4^2021^2027^4^1|JS6^2022^2027^4^1|T9^2021^2027^13^1|Refine^2014^2027^12^4|JS4^2020^2027^4^1|e-S2^2020^2027^0^1",
      jmc: "Vigus^2020^2027^13^1|Yuhu^2019^2027^13^1|E-Suv^2023^2027^4^1|Baodian^2014^2027^13^3",
      neta: "Neta V^2022^2027^3^1|Neta U^2021^2027^4^1|Neta S^2022^2027^9^1|Neta GT^2023^2027^9^1|Neta X^2024^2027^3^1",
      xiaomi: "SU7^2024^2027^5^1|YU7^2025^2027^4^1|SU7 Ultra^2025^2027^5^1"
    };
    Object.keys(NEW_MD).forEach(function (bid) {
      if (!R.md[bid]) R.md[bid] = [];
      var exist = {}; R.md[bid].forEach(function (m) { exist[nk(m[0])] = 1; });
      NEW_MD[bid].split("|").forEach(function (r) {
        var f = r.split("^"), rec = [f[0], +f[1], +f[2], +f[3], +f[4] || 1];
        if (!exist[nk(f[0])]) { R.md[bid].push(rec); exist[nk(f[0])] = 1; }
      });
    });

    var models = [];
    Object.keys(R.md).forEach(function (bid) {
      R.md[bid].forEach(function (m) { models.push({ id: bid + "-" + slug(m[0]), b: bid, n: m[0], y: [m[1], m[2]] }); });
    });
    var NEW_APP = [
      "daihatsu|Sirion;Move;Mira|1KR|e|998|1.0 VVT-i|69:95,83:100|BVM5|2013|2027",
      "daihatsu|Terios;Rocky|1NR|e|1496|1.5 VVT-i|95:130,105:140|CVT|2017|2027",
      "daihatsu|Tanto|KF|e|658|0.66 Turbo|64:100|CVT|2019|2027",
      "isuzu|D-Max III;MU-X II|4JJ3|d|1898|1.9 DDi|164:360|BVA|2020|2027",
      "isuzu|D-Max II;D-Max III|4JK1|d|2499|2.5 DDi|136:320,163:380|BVM6|2012|2020",
      "isuzu|N-Series|4HK1|d|5193|5.2 Turbo Diesel|190:510|BVM6|2014|2027",
      "infiniti|Q50;Q60|VR30|e|2997|3.0 V6 Biturbo|300:400,405:475|BVA|2016|2024",
      "infiniti|QX50;QX55|KR20|e|1997|2.0 VC-Turbo|268:380|CVT|2018|2027",
      "infiniti|QX60;QX80|VK56|e|5552|5.6 V8|400:560|BVA|2018|2027",
      "acura|Integra;TLX|K20C|e|1996|2.0 VTEC Turbo|272:380,355:480|BVM6|2021|2027",
      "acura|MDX;RDX|J35|e|3471|3.5 V6|290:362|BVA|2019|2027",
      "acura|ZDX|ULT-A|b|0|Ultium AWD|500:650|RED|2024|2027",
      "acura|NSX|JNC1|h|3493|3.5 V6 Hybrid SH-AWD|581:645|DCT9|2017|2022",
      "kgm|Torres;Korando IV|G15T|e|1497|1.5 T-GDi|163:280|BVA|2019|2027",
      "kgm|Rexton II;Musso|D22DT|d|2157|2.2 e-XDi|202:441|BVA|2017|2027",
      "kgm|Torres EVX|KGM-E|b|0|Électrique|207:339|RED|2023|2027",
      "gmc|Hummer EV|ULT-H|b|0|Ultium 800V|635:1200,830:1500,1000:1600|RED|2022|2027",
      "gmc|Sierra 1500;Yukon;Acadia|L84|e|5328|5.3 V8|355:519|BVA|2019|2027",
      "gmc|Sierra HD;Yukon|L8T|e|6162|6.2 V8|420:624|BVA|2019|2027",
      "gmc|Sierra 1500;Canyon|LZ0|d|2999|3.0 Duramax|277:624,305:671|BVA|2019|2027",
      "gmc|Terrain;Acadia|LSY|e|1998|2.0 Turbo|237:350|BVA|2018|2027",
      "ram|1500 DT;1500 Classic|HEMI|e|5654|5.7 V8 HEMI eTorque|395:556|BVA|2019|2027",
      "ram|1500 DT|SST|e|2993|3.0 Hurricane|420:635,540:706|BVA|2022|2027",
      "ram|2500 HD|CTD|d|6690|6.7 Cummins|370:1150,420:1460|BVA|2019|2027",
      "ram|1500 REV|RAM-E|b|0|Électrique|654:841|RED|2025|2027",
      "ram|ProMaster|PENTA|e|3604|3.6 V6 Pentastar|280:347|BVA|2014|2027",
      "dodge|Charger VII;Challenger III;Durango IV|HEMI|e|5654|5.7 V8 HEMI|370:529,395:556|BVA|2015|2023",
      "dodge|Charger VII;Challenger III|HEMI-HC|e|6166|6.2 V8 Hellcat|717:881,797:958,807:958|BVA|2015|2023",
      "dodge|Charger Daytona|STLA-L|b|0|STLA Large EV|496:672,670:850|RED|2024|2027",
      "dodge|Hornet|FFT4|e|1332|1.3 T4|177:270|BVA|2023|2027",
      "dodge|Hornet|FFPHEV|p|1332|Plug-in Q4|288:383|BVA|2023|2027",
      "chrysler|Pacifica;Voyager|PENTA|e|3604|3.6 V6 Pentastar|287:347|BVA|2017|2027",
      "chrysler|Pacifica|PENTAP|p|3604|3.6 V6 Plug-in|260:312|eCVT|2018|2027",
      "buick|Enclave;Envision;Encore GX|LSY|e|1998|2.0 Turbo|228:350,237:350|BVA|2016|2027",
      "buick|Envista|LFV|e|1490|1.5 Turbo|156:250|CVT|2024|2027",
      "lincoln|Navigator IV|ECOB35|e|3498|3.5 V6 EcoBoost|440:691|BVA|2018|2027",
      "lincoln|Aviator II;Nautilus|ECOB30|e|2998|3.0 V6 EcoBoost|400:563|BVA|2020|2027",
      "lincoln|Aviator II|ECOB30P|p|2998|Grand Touring PHEV|494:813|BVA|2020|2027",
      "lincoln|Corsair|DRAGON|e|1496|1.5 EcoBoost|180:240|BVA|2020|2027",
      "rivian|R1T;R1S|RIV-Q|b|0|Quad Motor|835:1231|RED|2022|2027",
      "rivian|R1T;R1S;R2|RIV-D|b|0|Dual Motor|533:829,665:1231|RED|2022|2027",
      "lucid|Air|LUC-S|b|0|Électrique|480:600,819:1200,1234:1940|RED|2022|2027",
      "lucid|Gravity;Earth|LUC-G|b|0|Électrique|828:1234|RED|2025|2027",
      "bentley|Bentayga;Continental GT III;Flying Spur|EA825|e|3996|4.0 V8|550:770|ZF8|2018|2027",
      "bentley|Bentayga;Continental GT III|BENW12|e|5950|6.0 W12|635:900,659:900|ZF8|2016|2024",
      "bentley|Bentayga;Flying Spur|BENP|p|2995|3.0 V6 Plug-in|462:700|ZF8|2021|2027",
      "rolls|Cullinan;Ghost II;Phantom VIII|RRV12|e|6749|6.75 V12|571:850,600:900|ZF8|2017|2027",
      "rolls|Spectre|RR-E|b|0|Électrique|585:900|RED|2023|2027",
      "aston|DBX;Vantage IV;DB12;DB11|M177|e|3982|4.0 V8 Biturbo|510:685,550:685,680:800,725:800|ZF8|2016|2027",
      "aston|DB12;DBS;Valour|ASTV12|e|5204|5.2 V12 Biturbo|700:900,725:900|ZF8|2016|2027",
      "aston|Valhalla|ASTV6P|p|3982|V8 Plug-in Hybrid|1012:1100|DCT8|2025|2027",
      "mclaren|Artura|MCLV6P|p|2993|3.0 V6 Hybrid|680:720,700:720|DCT8|2022|2027",
      "mclaren|750S;720S;Senna|MCLV8|e|3994|4.0 V8 Biturbo|720:770,750:800,800:800|DCT7|2017|2027",
      "mclaren|W1|MCLV8P|p|3994|V8 Hybrid|1275:1340|DCT8|2025|2027",
      "lotus|Emira|LOTV6|e|3456|3.5 V6 Supercharged|400:420,430:430|BVM6|2022|2027",
      "lotus|Emira|LOTI4|e|1991|2.0 Turbo AMG|365:430|DCT8|2022|2027",
      "lotus|Eletre;Emeya|LOT-E|b|0|Électrique|603:710,905:985|RED|2023|2027",
      "lotus|Evija|LOT-EV|b|0|Électrique Hypercar|2000:1700|RED|2024|2027",
      "ferrari|Roma;Portofino;F8|FERV8|e|3855|3.9 V8 Biturbo|620:760,720:770|DCT8|2017|2027",
      "ferrari|296 GTB;SF90|FERV6P|p|2992|3.0 V6 Hybrid|830:740,1000:800|DCT8|2019|2027",
      "ferrari|812;12Cilindri|FERV12|e|6496|6.5 V12|725:716,800:718,830:725|DCT8|2017|2027",
      "ferrari|Purosangue|FERV12S|e|6496|6.5 V12|725:716|DCT8|2023|2027",
      "lamborghini|Urus|EA825L|e|3996|4.0 V8 Biturbo|650:850,666:850|ZF8|2018|2027",
      "lamborghini|Urus|EA825LP|p|3996|4.0 V8 SE|800:950|ZF8|2024|2027",
      "lamborghini|Huracan|LAMV10|e|5204|5.2 V10|610:560,640:600|DCT7|2014|2024",
      "lamborghini|Revuelto|LAMV12P|p|6498|6.5 V12 Hybrid|1015:1000|DCT8|2023|2027",
      "lamborghini|Temerario|LAMV8P|p|3995|4.0 V8 Hybrid|920:800|DCT8|2024|2027",
      "maserati|Grecale;Levante;Ghibli|GME-M|e|1995|2.0 Turbo MHEV|300:450,330:450|ZF8|2016|2027",
      "maserati|MC20;GranTurismo II|NETTUNO|e|2995|3.0 V6 Nettuno|490:600,550:650,630:730|DCT8|2021|2027",
      "maserati|Grecale|GRE-E|b|0|Folgore Électrique|557:820|RED|2024|2027",
      "bugatti|Chiron;Divo;Bolide|W16|e|7993|8.0 W16 Quad-Turbo|1500:1600,1600:1600,1850:1850|DCT7|2016|2027",
      "bugatti|Tourbillon|V16P|p|8300|8.3 V16 Hybrid|1800:1800|DCT8|2026|2027",
      "lada|Vesta;Granta|VAZ21129|e|1596|1.6 16v|106:148|BVM5|2015|2027",
      "lada|Vesta|VAZ21179|e|1774|1.8 16v|122:170|BVM5|2016|2027",
      "lada|Niva Travel;Niva Legend|VAZ2123|e|1690|1.7 8v|83:129|BVM5|2014|2027",
      "hongqi|E-HS9;E-HS3|HQ-E|b|0|Électrique|344:450,435:600,551:750|RED|2020|2027",
      "hongqi|H9;HS5;HS7|HQPT|e|1998|2.0 Turbo|224:380,252:380|BVA|2019|2027",
      "hongqi|EH7|HQ-E2|b|0|Électrique|344:450,598:760|RED|2024|2027",
      "li|L7;L9;L8;L6|LIREV|p|1496|EREV Prolongateur|449:620,544:710|RED|2022|2027",
      "li|Mega|LIBEV|b|0|Électrique 800V|544:710|RED|2024|2027",
      "denza|Z9 GT;N7;N8|DEN-E|b|0|Électrique|313:360,517:700|RED|2023|2027",
      "denza|D9;Z9 GT|DEN-P|p|1498|DM-i PHEV|428:681|eCVT|2023|2027",
      "yangwang|U8;U7|YW-E4|b|0|e4 Quad Motor|1197:1280|RED|2023|2027",
      "yangwang|U9|YW-E4S|b|0|e4 Super|1306:1680|RED|2024|2027",
      "fangchengbao|Bao 5;Bao 8|FCB-P|p|1498|DMO Plug-in|505:760,687:1000|eCVT|2023|2027",
      "fangchengbao|Tai 3|FCB-E|b|0|Électrique|422:510|RED|2025|2027",
      "exeed|TXL;VX;RX;LX|SQRF4J20|e|1998|2.0 TGDi|254:390,261:400|DCT7|2021|2027",
      "exeed|ES;ET|EXE-E|b|0|Électrique E0X|469:660|RED|2024|2027",
      "jetour|Dashing;X70;X90;T2;Traveller|SQRF4J16|e|1598|1.6 TGDi|186:275|DCT7|2020|2027",
      "jetour|T2;Traveller|SQRF4J20|e|1998|2.0 TGDi|254:390|DCT7|2023|2027",
      "gwm|Poer;Cannon;Wingle 7|GW4C20|e|1998|2.0 Turbo|224:385|DCT7|2020|2027",
      "gwm|Poer;Cannon|GW4D20|d|1996|2.0 Diesel|163:400|BVM6|2014|2027",
      "tank|Tank 300;Tank 500;Tank 700|GW4C20T|e|1998|2.0 Turbo|224:385,252:387|BVA|2021|2027",
      "tank|Tank 400;Tank 500;Tank 700|TANK-P|p|1998|Hi4-T PHEV|408:750,517:750|BVA|2023|2027",
      "roewe|RX5 III;i5;D7|15E4E|e|1490|1.5 TGI|173:275|DCT7|2019|2027",
      "roewe|Marvel R;D7|ROE-E|b|0|Électrique|184:310,288:450|RED|2021|2027",
      "maxus|E Deliver 9;Deliver 7|MAX-E|b|0|Électrique|204:310|RED|2021|2027",
      "maxus|T90 EV;T60|MAX-P|d|1996|2.0 Diesel Bi-Turbo|215:500|BVA|2017|2027",
      "maxus|Mifa 9;Euniq 5|MAX-M|b|0|Électrique MPV|245:350|RED|2020|2027",
      "wuling|Mini EV;Air EV|WUL-S|b|0|Électrique|27:85,41:110,68:150|RED|2020|2027",
      "wuling|Bingo;Almaz;Confero;Cortez|WUL-E|e|1498|1.5 Turbo|108:180,143:250|CVT|2017|2027",
      "baojun|KiWi EV;Yep;Cloud|BAO-E|b|0|Électrique|54:150,102:180,136:200|RED|2021|2027",
      "baojun|530;510|BAO-P|e|1451|1.5 Turbo|147:250|CVT|2017|2027",
      "aiways|U5;U6;U7|AIW-E|b|0|Électrique|204:310,218:310|RED|2020|2027",
      "seres|Seres 3;Seres 5|SER-E|b|0|Électrique|163:300,224:360|RED|2022|2027",
      "seres|Seres 5;Seres 7;Seres 8|SER-P|p|1498|EREV Prolongateur|255:360,462:650|RED|2023|2027",
      "aito|M5;M7;M9;M8|AITO-P|p|1498|EREV Huawei|272:360,496:675,530:850|RED|2022|2027",
      "avatr|Avatr 11;Avatr 12;Avatr 07;Avatr 06|AVA-E|b|0|Électrique Huawei|425:650,578:650|RED|2022|2027",
      "deepal|S07;S05;G318|DEE-E|b|0|Électrique|218:320,258:320|RED|2023|2027",
      "deepal|SL03;S07|DEE-P|p|1498|EREV|218:320,258:320|RED|2022|2027",
      "changan|CS75 Plus;UNI-K;UNI-T;CS55 Plus;CS35 Plus|JL473|e|1499|1.5 Blue Core|178:265,188:300|DCT7|2018|2027",
      "changan|UNI-K;Hunter|JL486|e|1998|2.0 Blue Core|233:390|BVA|2021|2027",
      "voyah|Free;Courage|VOY-E|b|0|Électrique|510:700,690:1040|RED|2021|2027",
      "voyah|Dream;Passion|VOY-P|p|1498|EREV|510:700|RED|2022|2027",
      "dongfeng|Box;Aeolus Yixuan|DF-E|b|0|Électrique|95:160,122:230|RED|2019|2027",
      "dongfeng|Forthing T5;Aeolus L7;Rich 6|DF-P|e|1499|1.5 Turbo|177:270|DCT7|2019|2027",
      "jac|e-JS4;e-S2|JAC-E|b|0|Électrique|136:230,192:310|RED|2020|2027",
      "jac|JS6;JS4;T9;Refine|JAC-P|e|1499|1.5 TGDi|174:280|DCT6|2014|2027",
      "jmc|Vigus;Yuhu;Baodian|JMC-D|d|2402|2.4 Diesel|140:340|BVM6|2014|2027",
      "jmc|E-Suv|JMC-E|b|0|Électrique|204:320|RED|2023|2027",
      "neta|Neta V;Neta X|NET-S|b|0|Électrique|95:150,170:310|RED|2022|2027",
      "neta|Neta U;Neta S;Neta GT|NET-E|b|0|Électrique|204:310,231:310,462:620|RED|2021|2027",
      "xiaomi|SU7;SU7 Ultra|XIA-E|b|0|Électrique|299:400,673:838,1548:1770|RED|2024|2027",
      "xiaomi|YU7|XIA-E2|b|0|Électrique SUV|496:690,691:866|RED|2025|2027"
    ];
    NEW_APP.forEach(function (row) {
      var f = row.split("|"), bid = f[0], toks = f[1].split(";"), code = f[2], fuel = f[3], disp = +f[4], label = f[5];
      var vars = f[6].split(",").map(function (v) { var p = v.split(":"); return [+p[0], +p[1]]; });
      var gb = f[7], y0 = +f[8], y1 = +f[9];
      models.forEach(function (m) {
        if (m.b !== bid) return;
        var mn = nk(m.n), hit = false;
        for (var t = 0; t < toks.length; t++) { var tk = nk(toks[t]); if (tk === "*") { hit = true; break; } if (tk && mn.indexOf(tk) > -1) { hit = true; break; } }
        if (!hit) return;
        var a = Math.max(y0, m.y[0]), b = Math.min(y1, m.y[1]); if (a > b) return;
        if (!R.me[m.id]) R.me[m.id] = [];
        vars.forEach(function (v) {
          var dup = R.me[m.id].some(function (e) { return e[0] === code && e[5] === v[0] && e[7] === gb; });
          if (!dup) R.me[m.id].push([code, code, label + " " + v[0], fuel, disp, v[0], v[1], gb, a, b]);
        });
      });
    });
    /* couverture : chaque nouveau modèle reçoit au moins une motorisation de sa marque */
    models.forEach(function (m) {
      if (R.me[m.id] && R.me[m.id].length) return;
      var donor = null;
      NEW_APP.some(function (row) { var f = row.split("|"); if (f[0] === m.b) { donor = f; return true; } return false; });
      if (!donor) return;
      var v = donor[6].split(",")[0].split(":");
      R.me[m.id] = [[donor[2], donor[2], donor[5] + " " + v[0], donor[3], +donor[4], +v[0], +v[1], donor[7], m.y[0], m.y[1]]];
    });

    var NEW_FT = [
      "Courroie distribution 1.6 HDi DV6 — crépine colmatée|DV6;DV6FC|308 II;3008 I;5008 I;C4 II;DS4;Berlingo II|2;3|critique|moyenne|2017|2019|80000|180000|Voyant pression huile;Casse turbo;Débris carter|Courroie bain huile dégradée et crépine d alimentation turbo colmatée.|Courroie dernière référence + dépose carter + nettoyage crépine et circuit + huile spec.|500|1600|Surveillance renforcée|Distribution",
      "Chaîne distribution N47 B47 — allongement arrière|N47;B47;B57|Série 1;Série 3;Série 5;X1;X3;X5;Countryman|3;4;6;7|critique|moyenne|2017|2021|90000|220000|Cliquetis côté boîte;Casse chaîne;Calage distribution|Chaîne en bout de moteur côté volant moteur, guides et tendeurs usés.|Kit chaîne complet dernière référence + guides + tendeur + dépose moteur si nécessaire.|1500|3500|Surveillance|Distribution",
      "Vanne EGR diesel 2.0 TDI EA189 EA288 — encrassement|EA189;EA288;DFGA;DSUA|Golf VII;Golf VIII;Passat B8;Tiguan II;Octavia III;Leon III;A4 B9;A3 8V|3;4;7;8|modérée|élevée|2017|2027|40000|160000|À-coups;Fumée noire;Mode dégradé;Voyant moteur|Calamine clapet EGR et radiateur basse pression en usage urbain.|Nettoyage ou remplacement vanne EGR + radiateur + adaptation valise.|150|900|Surveillance|Antipollution",
      "Boîte DSG7 DQ200 — usure embrayage sec|DQ200|Polo VI;Golf VII;Golf VIII;T-Roc;Octavia III;Octavia IV;Fabia III;Ibiza V;Leon III;A1 II;A3 8V|3;4;5;6;7;8|majeure|moyenne|2017|2027|60000|150000|Broutage démarrage;Patinage;Passage point mort;Voyant boîte|Embrayage sec et accumulateur mécatronique fatigués en usage urbain.|Kit embrayage + mécatronique si défaut pression + huile G 052 512 + apprentissages.|700|1900|TSB logiciel|Transmission",
      "Boîte ZF8 — vidange 100000 km|ZF8|Série 3 G20;Série 5 G30;X3 G01;X5 G05;Giulia;Stelvio;Defender L663;Range Rover V;Touareg III;Q7 II;Q8;A6 C8;Panamera III;Cayenne III;Charger VII;1500 DT|1;2;3;4;5;6;7;8|info|moyenne|2017|2027|80000|120000|À-coups à froid;Hésitations|Boîte annoncée lubrifiée à vie mais retours terrain favorisant la vidange.|Vidange ZF8 + crépine avec huile Lifeguard 8 à 100000 km.|350|650|Note entretien|Transmission",
      "Boîte CVT Xtronic — huile et patinage|CVT;XTR|Qashqai J11;Qashqai J12;X-Trail T32;Juke I;Juke II;Micra V;Note III;Sylphy|2;3;4;5|majeure|moyenne|2017|2027|60000|160000|Patinage;À-coups;Bruit de chaîne CVT;Surchauffe boîte|Huile CVT dégradée et chaîne poussante usée en usage chargé.|Vidange CVT NS-3 tous les 60000 km + apprentissages + contrôle refroidisseur.|300|2500|Note entretien|Transmission",
      "Boîte CVT Subaru Lineartronic — patinage|FB20;FB25;CVT|Impreza V;XV II;Crosstrek III;Forester V;Forester VI;Outback VI;Levorg II|2;3;5;6|majeure|moyenne|2017|2027|60000|160000|Patinage;À-coups;Voyant CVT;Surchauffe|Huile CVT dégradée et chaîne usée.|Vidange CVT Lineartronic 60000 km + huile spec Subaru + apprentissages.|300|2600|TSB Subaru|Transmission",
      "Turbo 1.5 VTEC L15B — dilution essence|L15B|Civic X;CR-V V;Accord;Integra;TLX|10;5;2;5|majeure|moyenne|2017|2021|5000|90000|Niveau huile qui monte;Odeur essence;Voyant huile;Claquement|Trajets courts par climat froid envoyant essence dans le carter.|Mise à jour PGM-FI + vidanges rapprochées + trajets longs réguliers + contrôle niveau.|100|300|TSB calculateur|Moteur",
      "Turbo 2.0 VC-Turbo KR20 — bielles et coussinets|KR20|QX50;QX55;QX60;Altara|2;1|critique|faible|2018|2024|60000|150000|Cognement à chaud;Limaille;Casse moteur|Mécanisme de rapport volumétrique variable sensible à l huile et aux charges.|Analyse huile + contrôle jeu coussinets + huile spec Nissan VC-Turbo + vidange 10000 km.|400|6500|Campagne constructeur|Moteur",
      "HEMI 5.7 — poussoirs AFM et arbre à cames|HEMI;HEMI-HC|Charger VII;Challenger III;Durango IV;1500 DT;1500 Classic;Grand Cherokee WL|4;5;7|critique|moyenne|2017|2023|60000|180000|Claquement haut moteur;Ratés;Casse arbre à cames|Poussoirs de désactivation AFM et rouleaux usés.|Kit poussoirs révisé + arbre à cames + huile MS-6395 spec.|1500|4500|Surveillance renforcée|Moteur",
      "Cummins 6.7 — EGR et turbo HD|CTD|2500 HD;3500 HD|4|modérée|moyenne|2017|2027|100000|300000|Voyant moteur;Perte puissance;Fumée noire|Usage charge lourde, EGR et turbo géométrie encrassés.|Nettoyage EGR + turbo + régénération DPF + huile spec Cummins.|600|4000|Surveillance|Antipollution",
      "Batterie HV Chevrolet Bolt — cellules LG|ULT|Bolt EV|1|critique|moyenne|2017|2022|0|100000|Odeur;Fumée;Charge limitée;Voyant HV|Court-circuit interne cellules LG sur lots identifiés.|Rappel : remplacement modules ou pack complet + limitation charge transitoire + stationner extérieur.|0|0|Rappel constructeur|Batterie HV",
      "Batterie HV Hyundai Kona Ioniq — cellules LG|LGEV;EVK|Kona I;Ioniq I;Niro I;I-Pace|1;2|critique|moyenne|2018|2023|0|100000|Charge limitée;Odeur;Voyant batterie;Perte autonomie|Court-circuit interne cellules LG.|Rappel : BMS + modules ou pack complet + consignes stationnement.|0|0|Rappel constructeur|Batterie HV",
      "E-GMP 800V — ICCU et charge AC|EGMP|Ioniq 5;Ioniq 6;Ioniq 9;EV6;EV9;GV60|1|majeure|moyenne|2021|2027|5000|90000|Batterie 12V non chargée;Charge AC impossible;Perte puissance;Voyant système|ICCU fusible ou transformateur défaillant.|Rappel logiciel ICCU puis remplacement si DTC + contrôle batterie 12V et DC-DC.|0|2700|Rappel constructeur|Charge",
      "e-TNGA — boulons de moyeu|E4TN|bZ4X;RZ;Solterra|1|critique|faible|2022|2023|0|6000|Risque desserrage roue;Vibration;Bruit|Défaut d assemblage moyeu premiers lots.|Rappel : boulons moyeu remplacés + couple contrôlé + VIN avant livraison.|0|0|Rappel constructeur|Pneumatiques",
      "Skyactiv-D 2.2 — dilution repère X|SH;SKD33|Mazda3 III;Mazda6 III;CX-5 I;CX-5 II;CX-60;CX-80|1;2;3|majeure|élevée|2017|2027|10000|100000|Niveau au-dessus repère X;Odeur gazole;Voyant huile|Régénérations FAP incomplètes envoyant gazole dans le carter.|Vidange 10000 km + jauge repère X à chaque plein + mise à jour PCM + huile DL-1.|100|350|TSB Mazda|Moteur",
      "MultiAir TwinAir — module hydraulique|TA;MAIR;TJET|Panda III;500 III;595;695;Giulietta;Renegade|1;3|critique|moyenne|2017|2020|40000|130000|Ratés;Mode dégradé;Claquement haut moteur|Actionneurs électro-hydrauliques très sensibles à la spécification huile.|Module MultiAir + huile 5W-40 C3 9.55535-S2 exclusivement + filtre.|700|1600|Surveillance|Moteur",
      "Suspension pneumatique — boudins et compresseur|AJ300;AJV8;AJ300D;M256;OM656;DCBE;CVMD|Range Rover IV;Range Rover V;Range Rover Sport III;Discovery 5;Defender L663;GLE V167;GLS X167;Touareg III;Q7 II;Q8|3;4;5;2|modérée|moyenne|2017|2027|80000|200000|Affaissement;Compresseur bruyant;Voyant suspension|Boudins et compresseur vieillissants.|Remplacement boudin ou compresseur + calibration hauteur valise.|400|2500|Surveillance|Suspension",
      "Freins carbone céramique — usage routier|9A2;MA2;EA825;FERV8;LAMV10|911 992;718 Cayman;Cayenne III;Roma;Huracan;Urus|8;4;3;1;2|info|faible|2017|2027|0|200000|Bruit à froid;Usure atypique;Coût élevé|Disques CCB sensibles aux chocs et au sel en usage routier.|Contrôle fissures + pads spec + usage piste privilégié.|0|0|Note utilisation|Freinage",
      "Boîte PDK — vidange 60000 km|PDK|911 991;911 992;718 Cayman;718 Boxster;Macan I;Cayenne III;Panamera III|7;8;4;1;2;3|info|moyenne|2017|2027|55000|65000|À-coups si huile dégradée|Boîte double embrayage dont huile doit être renouvelée.|Vidange PDK + filtre 60000 km + huile spec Porsche.|400|800|Note entretien|Transmission",
      "Boîte DCT8 AMG — vidange 60000 km|DCT8|M139;S58;Classe A 45;CLA 45;GLA 45;AMG GT;M2 G87;M3 G80|4;2;1;6|info|moyenne|2018|2027|55000|65000|À-coups;Usure prématurée|Embrayage humide sensible à l huile.|Vidange DCT8 + filtre 60000 km + huile SP-IV M.|350|700|Note entretien|Transmission",
      "VE Chine — 12V et campagnes OTA|LPEV;GWMEV;XPEV;NIOEV;GEEE;CHEREV;EMG;EBY;SEAE;DEN-E;HQ-E;AVA-E;DEE-E;NET-E;XIA-E|C10;ORA 03;G6;ET5;EX5;Omoda E5;MG4;Seal;Zeekr X;Tiggo 7;H6;Z9 GT;E-HS9;Avatr 11;S07;Neta V;SU7|1|modérée|moyenne|2022|2027|5000|80000|Écran figé;Non prêt après OTA;Voyants multiples;Batterie à plat|Batterie 12V plomb sollicitée par veille et campagnes OTA successives.|Batterie 12V AGM + dernière version logicielle + maintien de charge + gestion veille.|120|380|Surveillance|Batterie 12V",
      "EREV Li Auto / Seres / AITO — thermique peu sollicité|LIREV;SER-P;AITO-P;VOY-P;DEE-P|L7;L9;L8;L6;Seres 5;Seres 7;M5;M7;M9;Dream;SL03|1|info|moyenne|2022|2027|0|120000|Huile ancienne malgré faible km;Odeur essence|Thermique utilisé comme générateur, cycles courts et faible sollicitation.|Vidange annuelle impérative même à faible kilométrage + contrôle dilution.|120|350|Note entretien|Moteur",
      "Pompe à chaleur VE — vanne 4 voies|EGMP;APP550;EM2;GEEE;DEN-E;AVA-E|Ioniq 5;EV6;ID.4;3008 III;EX5;Z9 GT;Avatr 11|1|modérée|moyenne|2021|2027|20000|150000|Chauffage faible en hiver;Bruit;Autonomie réduite|Vanne 4 voies ou compresseur électrique défaillant.|Diagnostic circuit frigorifique + vanne + mise à jour logiciel thermique.|400|2400|Surveillance|Climatisation",
      "Freinage régénératif — corrosion disques|APP310;APP550;EGMP;EVK;EMG;EBY;ZKX;TSLAR;TSLALR;EVV;PST;E4TN;GE1;LGEV;ULT|R1T;R1S;Air;Gravity;ID.3;ID.4;Ioniq 5;EV6;MG4;Seal;e-208;Model 3;Model Y;XC40;Polestar 2;bZ4X;Mach-E;Bolt EV|1;2|mineure|élevée|2017|2027|15000|120000|Disques corrodés;Bruit au freinage;Freinage moins mordant|Freinage régénératif sollicitant peu les mécanismes.|Nettoyage et lubrification annuel des mécanismes + purge liquide 24 mois.|80|300|Note entretien|Freinage",
      "Direction assistée électrique EPS — capteur angle|EB2;DV5;DPCA;B48;M254;G4FP;H5Ht;PE|208;3008;C3;Golf;Série 3;Classe C;Tucson;Clio;Mazda3|1;2;3;4|modérée|moyenne|2017|2027|40000|180000|Direction dure;Voyant EPS;À-coups;Perte assistance|Capteur angle ou moteur EPS défaillant.|Diagnostic EPS + calibration capteur angle + remplacement si nécessaire + effacement défauts.|250|1500|Surveillance|Direction",
      "Caméra ADAS — calibration après vitrage|EB2;DPCA;B48;M254;G4FP;EGMP;APP310|3008;5008;Golf;Série 3;Classe C;Tucson;Ioniq 5;ID.3|2;3;4;1|modérée|moyenne|2019|2027|0|200000|ACC indisponible;Maintien de voie inactif;Voyant ADAS|Caméra désalignée après remplacement pare-brise ou choc.|Calibration statique et dynamique caméra + radar si nécessaire.|150|600|Note entretien|ADAS",
      "Toit panoramique — drains et infiltration|EB2;DPCA;B48;M254;AJ200P;G4FP|3008;5008;Tiguan;Série 3;Classe C;Evoque;Tucson|2;3;4|mineure|moyenne|2017|2027|40000|200000|Traces eau ciel de toit;Odeur humidité;Bruit eau|Drains bouchés et joints vieillis.|Nettoyage drains + joints + séchage habitacle + contrôle évacuations.|80|700|Surveillance|Carrosserie",
      "Batterie 12V Stop and Start — usure|EB2;DV5;H5Ht;DPCA;B48;M254;G4FP;FOX|208;3008;C3;Clio;Golf;Série 3;Classe C;Tucson;Fiesta|1;2;3;4|modérée|élevée|2017|2027|20000|90000|Non prêt;Voyants aléatoires;Stop and Start inactif|Batterie AGM EFB sollicitée par cycles courts et veille.|Batterie AGM EFB + test alternateur + reset BSI + contrôle DC-DC.|150|400|Surveillance|Batterie 12V",
      "Injecteurs diesel HDi TDI CRDi — débit retour|DV5;DW10;EA288;OM654;B47;AJ200D;GD;MJ16;D4HC;4N15;YS23;CTD|3008;508;Tiguan;Classe C;Série 3;Defender;Hilux;Ducato;Sorento;L200;Navara;2500 HD|2;3;4|modérée|moyenne|2017|2027|80000|250000|Claquements;Démarrage difficile;Fumée;Ralenti instable|Usure injecteurs et qualité gazole, dérive débits retour.|Test débit retour + codage IMA SCN + remplacement hors cote.|400|2200|Surveillance|Injection",
      "AdBlue SCR — cristallisation et countdown|DV5;DW10;EA288;OM654;B47;PANTHER;AJ200D;SH;GD;MJ16;D4HC;4N15;YS23;CTD;LZ0|3008;508;Tiguan;Classe C;Série 3;Transit;Defender;CX-5;Hilux;Ducato;Sorento;L200;Navara;2500 HD;Silverado|2;3;4;5|modérée|élevée|2017|2027|20000|150000|Countdown antipollution;Niveau AdBlue;P20E8;Odeur ammoniaque|Urée vieillie, cristallisation réservoir et injecteur, appoints tardifs.|Réservoir pompe + injecteur urée + sondes NOx + reset SCR + AdBlue frais ISO 22241.|300|1900|Surveillance + rappel partiel|Antipollution",
      "FAP DPF — colmatage urbain|DV5;DW10;EA288;OM654;B47;PANTHER;AJ200D;SH;GD;MJ16;D4HC;4N15;YS23;CTD;LZ0|3008;508;Tiguan;Classe C;Série 3;Transit;Defender;CX-5;Hilux;Ducato;Sorento;L200;Navara;2500 HD;Silverado|2;3;4;5|modérée|élevée|2017|2027|30000|150000|Voyant FAP;Régénérations fréquentes;Mode dégradé;Dilution huile|Régénérations incomplètes en usage urbain.|Régénération forcée + nettoyage ou remplacement FAP + vidange immédiate si dilution + trajets autoroutiers.|120|1800|Surveillance|Antipollution",
      "Boîte transfert 4x4 — chaîne détendue|CYNB;CSZB;CWGD;AJV8;ECOB35|Macan I;Cayenne III;Range Rover Sport III;Discovery 5;Navigator IV|1;3;4|modérée|moyenne|2017|2027|70000|200000|À-coups;Bruit accélération;Voyant 4x4|Chaîne de transfert détendue.|Remplacement transfert échange standard + huile spec + calibration.|900|3200|Surveillance|Transmission",
      "Frein de parking électrique EPB — actionneur|EB2;DV5;DPCA;B48;M254;G4FP;HEMI|3008;5008;C5;Golf;Passat;Série 3;Classe C;Tucson;Durango|2;3;4|modérée|moyenne|2017|2027|60000|200000|Blocage;Voyant EPB;Frein ne se desserre pas|Actionneur ou câble fatigué.|Remplacement actionneur + procédure dépose + calibration valise.|250|1000|Surveillance|Freinage"
    ];
    var ftHave = {}; R.ft.forEach(function (f) { ftHave[nk(f[0])] = 1; });
    NEW_FT.forEach(function (r) { var f = r.split("|"); if (!ftHave[nk(f[0])]) { R.ft.push(f); ftHave[nk(f[0])] = 1; } });

    var NEW_TS = [
      "RPL-PSA-2019-DV6|peugeot;citroen;ds;opel|DV6;DV6FC|308 II;3008 I;C4 II;DS4;Berlingo II|2;3|RAPPEL courroie 1.6 HDi DV6|2019-07|Rappel|critique|Colmatage crépine alimentation turbo par débris courroie.|Courroie dernière référence + dépose carter + nettoyage crépine + circuit huile complet.|Distribution",
      "RPL-BMW-2021-N47|bmw;mini|N47;B47|Série 1;Série 3;X1;X3;Countryman|3;6;2;3;2|RAPPEL chaîne distribution N47 B47|2021-04|Rappel|critique|Allongement chaîne côté volant moteur pouvant casser le moteur.|Kit chaîne complet dernière référence + guides + tendeur + contrôle calage.|Distribution",
      "RPL-GM-2021-BOLT|chevrolet|ULT|Bolt EV|1|RAPPEL Bolt EV batterie LG|2021-08|Rappel|critique|Risque incendie cellules LG défaut fabrication.|Remplacement modules ou pack + logiciel limitation + stationner extérieur.|Batterie HV",
      "RPL-HK-2021-LG|hyundai;kia;jaguar|LGEV;EVK|Kona I;Ioniq I;Niro I;I-Pace|1;2|RAPPEL batterie LG cellules|2021-01|Rappel|critique|Risque incendie cellules LG sur lots identifiés.|BMS + modules ou pack + limitation transitoire + consignes stationnement.|Batterie HV",
      "RPL-HK-2024-ICCU|hyundai;kia;genesis|EGMP|Ioniq 5;Ioniq 6;EV6;EV9;GV60|1|RAPPEL ICCU 800V|2024-03|Rappel|majeure|Perte puissance et batterie 12V non chargée par ICCU défaillant.|Logiciel ICCU puis remplacement si DTC + contrôle batterie 12V.|Charge",
      "RPL-TYT-2022-WHEEL|toyota;lexus;subaru|E4TN|bZ4X;RZ;Solterra|1|RAPPEL boulons de roue e-TNGA|2022-06|Rappel|critique|Risque desserrage roue premiers lots.|Boulons moyeu remplacés + couple contrôlé + VIN avant livraison.|Pneumatiques",
      "TSB-NSN-2022-CVT|nissan;infiniti|CVT;XTR;KR20|Qashqai J11;Qashqai J12;X-Trail T32;Juke II;QX50;QX55|2;3;4;1;2|TSB CVT Xtronic et VC-Turbo|2022-05|Transmission|majeure|Patinage CVT et cognement VC-Turbo.|Vidange CVT NS-3 60000 km + huile spec VC-Turbo + analyse huile + apprentissages.|Transmission",
      "TSB-SUB-2022-CVT|subaru|FB20;FB25;CVT|Impreza V;XV II;Crosstrek III;Forester V;Forester VI;Outback VI|2;3;5;6|TSB CVT Lineartronic 60000 km|2022-02|Transmission|modérée|Patinage et à-coups si huile CVT dégradée.|Vidange CVT 60000 km + apprentissages + huile spec Subaru.|Transmission",
      "TSB-MZD-2019-DIL|mazda|SH;SKD33|Mazda3 III;Mazda6 III;CX-5 II;CX-60;CX-80|1;2;3|TSB Skyactiv-D jauge X et PCM|2019-03|Moteur|majeure|Dilution par régénérations FAP incomplètes.|Jauge repère X à chaque plein + vidange 10-12000 km + mise à jour PCM.|Moteur",
      "TSB-FCA-2018-MULTIAIR|fiat;abarth;alfa;jeep|TA;MAIR;TJET|Panda III;500 III;595;695;Giulietta;Renegade|1;3|TSB MultiAir huile 5W-40 C3 exclusive|2018-03|Moteur|majeure|Module MultiAir hydraulique très sensible à l huile.|5W-40 C3 9.55535-S2 exclusivement + vidange 15000 km maximum.|Moteur",
      "RPL-RAM-2023-HEMI|ram;dodge;chrysler;jeep|HEMI;HEMI-HC|1500 DT;Charger VII;Challenger III;Durango IV|5;7;3;4|RAPPEL poussoirs AFM HEMI|2023-04|Rappel|majeure|Usure poussoirs désactivation cylindres.|Kit poussoirs révisé + arbre à cames si atteint + huile MS-6395.|Moteur",
      "TSB-POR-2019-PDK|porsche|PDK|911 991;911 992;718 Cayman;Macan I;Cayenne III;Panamera III|7;8;4;1;3;2|TSB vidange PDK 60000 km|2019-06|Transmission|info|Huile PDK dégradée en usage urbain.|Vidange PDK + filtre 60000 km + huile spec Porsche.|Transmission",
      "TSB-MB-2020-DCT8|mercedes|DCT8;M139|Classe A W177;CLA C118;GLA H247;AMG GT|4;2;1|TSB vidange DCT8 AMG 60000 km|2020-08|Transmission|info|Embrayage humide sensible à l huile.|Vidange DCT8 + filtre 60000 km + huile SP-IV M.|Transmission",
      "TSB-CN-2025-OTA|byd;mg;chery;omoda;jaecoo;geely;lynkco;zeekr;xpeng;nio;leapmotor;ora;haval;denza;hongqi;aiways;seres;aito;avatr;deepal;changan;voyah;dongfeng;jac;jmc;neta;xiaomi|LPEV;GWMEV;XPEV;NIOEV;GEEE;CHEREV;EMG;EBY;SEAE;DEN-E;HQ-E;AVA-E;DEE-E;NET-E;XIA-E|C10;ORA 03;G6;ET5;EX5;Omoda E5;MG4;Seal;Zeekr X;Tiggo 7;H6;Z9 GT;E-HS9;Avatr 11;S07;Neta V;SU7|1|TSB VE Chine OTA et 12V|2025-02|Logiciel|mineure|Écrans figés et batterie 12V déchargée après OTA.|Dernière version logicielle + batterie 12V AGM + maintien de charge.|Logiciel",
      "TSB-CN-2025-EREV|li;seres;aito;voyah;deepal|LIREV;SER-P;AITO-P;VOY-P;DEE-P|L7;L9;L8;L6;Seres 5;Seres 7;M5;M7;M9;Dream;SL03|1|TSB EREV vidange annuelle|2025-04|Moteur|info|Thermique générateur peu sollicité, huile ancienne malgré faible km.|Vidange annuelle impérative + contrôle dilution + trajets longs réguliers.|Moteur",
      "TSB-CN-2025-HEAT|nio;xpeng;zeekr;byd;mg;leapmotor;denza;avatr|NIOEV;XPEV;SEAE;EBY;EMG;LPEV;DEN-E;AVA-E|ET5;G6;Zeekr X;Seal;MG4;C10;Z9 GT;Avatr 11|1|TSB pompe à chaleur vanne 4 voies|2025-01|Climatisation|modérée|Chauffage faible en hiver et autonomie réduite.|Vanne 4 voies + mise à jour logiciel thermique + contrôle compresseur.|Climatisation",
      "TSB-ALL-2024-ADAS|peugeot;vw;bmw;mercedes;hyundai;toyota;renault;ford;volvo;audi|EB2;DPCA;B48;M254;G4FP;EGMP;APP310;ZR;H5Ht;FOX;B4204T;DLAA|3008;5008;Golf;Série 3;Classe C;Tucson;Ioniq 5;ID.3;Corolla E210;Clio V;Focus IV;XC60 II;A3 8Y|2;3;4;1;12;5;7;8|TSB calibration ADAS après vitrage|2024-06|ADAS|modérée|ACC et maintien de voie indisponibles après remplacement pare-brise.|Calibration statique et dynamique caméra + radar si nécessaire.|ADAS",
      "TSB-ALL-2023-EPB|peugeot;citroen;vw;bmw;mercedes;hyundai;dodge|EB2;DV5;DPCA;B48;M254;G4FP;HEMI|3008;5008;C5;Golf;Passat;Série 3;Classe C;Tucson;Durango|2;3;4|TSB frein de parking électrique EPB|2023-09|Freinage|modérée|Blocage EPB et actionneur fatigué.|Remplacement actionneur + procédure dépose + calibration valise.|Freinage",
      "TSB-ALL-2022-12V|peugeot;renault;vw;bmw;mercedes;hyundai;ford;fiat|EB2;DV5;H5Ht;DPCA;B48;M254;G4FP;FOX;FFBSG|208;3008;C3;Clio;Golf;Série 3;Classe C;Tucson;Fiesta;Panda|1;2;3;4|TSB batterie 12V Stop and Start|2022-10|Batterie 12V|modérée|Non prêt et voyants aléatoires par batterie AGM EFB usée.|Batterie AGM EFB + test alternateur + reset BSI + contrôle DC-DC.|Batterie 12V",
      "TSB-ALL-2024-ROOF|peugeot;vw;bmw;mercedes;landrover;hyundai|EB2;DPCA;B48;M254;AJ200P;G4FP|3008;5008;Tiguan;Série 3;Classe C;Evoque;Tucson|2;3;4|TSB toit panoramique drains|2024-03|Carrosserie|mineure|Infiltration ciel de toit par drains bouchés.|Nettoyage drains + joints + séchage habitacle + contrôle évacuations.|Carrosserie",
      "TSB-ALL-2025-INJ|peugeot;vw;mercedes;bmw;landrover;toyota;fiat;kia;mitsubishi;nissan;ram|DV5;DW10;EA288;OM654;B47;AJ200D;GD;MJ16;D4HC;4N15;YS23;CTD|3008;508;Tiguan;Classe C;Série 3;Defender;Hilux;Ducato;Sorento;L200;Navara;2500 HD|2;3;4|TSB injecteurs diesel débit retour|2025-05|Injection|modérée|Claquements et démarrage difficile par usure injecteurs.|Test débit retour + codage IMA SCN + remplacement hors cote.|Injection",
      "TSB-ALL-2025-SCR|peugeot;vw;mercedes;bmw;ford;landrover;mazda;toyota;fiat;kia;mitsubishi;nissan;ram;chevrolet|DV5;DW10;EA288;OM654;B47;PANTHER;AJ200D;SH;GD;MJ16;D4HC;4N15;YS23;CTD;LZ0|3008;508;Tiguan;Classe C;Série 3;Transit;Defender;CX-5;Hilux;Ducato;Sorento;L200;Navara;2500 HD;Silverado|2;3;4;5|TSB AdBlue SCR cristallisation|2025-06|Antipollution|modérée|Countdown antipollution et cristallisation urée.|Réservoir pompe + injecteur urée + sondes NOx + reset SCR + AdBlue frais ISO 22241.|Antipollution",
      "TSB-ALL-2025-DPF|peugeot;vw;mercedes;bmw;ford;landrover;mazda;toyota;fiat;kia;mitsubishi;nissan;ram;chevrolet|DV5;DW10;EA288;OM654;B47;PANTHER;AJ200D;SH;GD;MJ16;D4HC;4N15;YS23;CTD;LZ0|3008;508;Tiguan;Classe C;Série 3;Transit;Defender;CX-5;Hilux;Ducato;Sorento;L200;Navara;2500 HD;Silverado|2;3;4;5|TSB FAP DPF colmatage urbain|2025-07|Antipollution|modérée|Régénérations incomplètes et dilution huile en usage urbain.|Régénération forcée + nettoyage ou remplacement FAP + vidange immédiate si dilution.|Antipollution",
      "TSB-LIN-2021-TRANSFER|porsche;landrover;lincoln|CYNB;CSZB;CWGD;AJV8;ECOB35|Macan I;Cayenne III;Range Rover Sport III;Discovery 5;Navigator IV|1;3;4|TSB boîte transfert 4x4|2021-11|Transmission|modérée|Chaîne transfert détendue et à-coups.|Remplacement transfert échange standard + huile spec + calibration.|Transmission"
    ];
    var tsHave = {}; R.ts.forEach(function (t) { tsHave[nk(t[0])] = 1; });
    NEW_TS.forEach(function (r) { var f = r.split("|"); if (!tsHave[nk(f[0])]) { R.ts.push(f); tsHave[nk(f[0])] = 1; } });
  })();

  /* ═══════════════ NOYAU APPLICATION ═══════════════ */
  var $ = window.MD_$, $$ = window.MD_$$, esc = window.MD_esc, fmt = window.MD_fmt, clamp = window.MD_clamp, uid = window.MD_uid,
    clone = window.MD_clone, ov = window.MD_ov, ic = window.MD_ic, deb = window.MD_deb, split = window.MD_split,
    nk = window.MD_nk, slug = window.MD_slug, safe = window.MD_safe, logErr = window.MD_logErr, STORE = window.MD_STORE,
    download = window.MD_download, beep = window.MD_beep, toast = window.MD_toast, openModal = window.MD_openModal,
    closeModal = window.MD_closeModal, confirmModal = window.MD_confirmModal, modalOpenFn = window.MD_modalOpen,
    WP = window.MD_WP, PREF = window.MD_PREF, ERRORS = window.MD_ERRORS;

  var PWD = "Kevin83600", TPWD = "expert83", KEY = "mecadata_v81", AKEY = "md_access_v81", PKEY = "md_pub_v81", YMAX = 2027, KMMAX = 200000;
  var SEGS = window.MD_RAW.segs;
  var FU = { e: { l: "Essence", c: "#FFAF2E" }, d: { l: "Diesel", c: "#4D8DFF" }, h: { l: "Hybride", c: "#43E08B" }, p: { l: "Hybride rechargeable", c: "#19B8A6" }, b: { l: "Électrique", c: "#E45CFF" }, g: { l: "GPL", c: "#A8E63C" } };
  var SV = { critique: { w: 32, c: "#FF4D5E" }, majeure: { w: 18, c: "#FF7A3D" }, "modérée": { w: 9, c: "#FFAF2E" }, mineure: { w: 4, c: "#4D8DFF" }, info: { w: 0, c: "#25D4EE" } };
  var FQ = { "élevée": 1.25, moyenne: 1, faible: 0.7 };
  var REGIONS = { france: "France", europe: "Europe", asie: "Asie", chine: "Chine", amerique: "Amérique" };
  var FILES = [["brands", "brands.json", "Marques"], ["models", "models.json", "Modèles"], ["engines", "engines.json", "Motorisations"], ["faults", "faults.json", "Pannes"], ["tsb", "tsb.json", "TSB / Rappels"]];
  function nsev(v) { var k = nk(v), m = { critique: "critique", critical: "critique", majeure: "majeure", major: "majeure", moderee: "modérée", moderate: "modérée", moyenne: "modérée", mineure: "mineure", minor: "mineure", faible: "mineure", info: "info", note: "info" }; return m[k] || (SV[v] ? v : "modérée"); }
  function nfreq(v) { var k = nk(v), m = { elevee: "élevée", high: "élevée", moyenne: "moyenne", medium: "moyenne", faible: "faible", low: "faible" }; return m[k] || (FQ[v] ? v : "moyenne"); }
  function nfuel(v) { var k = nk(v), m = { e: "e", essence: "e", petrol: "e", d: "d", diesel: "d", h: "h", hybride: "h", hybrid: "h", p: "p", phev: "p", rechargeable: "p", b: "b", ev: "b", electrique: "b", electric: "b", g: "g", gpl: "g" }; return m[k] || (FU[k] ? k : "e"); }
  function regionOf(p) { var k = nk(p); if (k.indexOf("france") > -1) return "france"; if (k.indexOf("chine") > -1 || k.indexOf("china") > -1) return "chine"; if (k.indexOf("japon") > -1 || k.indexOf("coree") > -1 || k.indexOf("vietnam") > -1 || k.indexOf("inde") > -1) return "asie"; if (k.indexOf("etatsunis") > -1 || k.indexOf("usa") > -1) return "amerique"; return "europe"; }
  var IVL = function (v) { return v >= 75 ? ["CRITIQUE", "#FF4D5E"] : v >= 50 ? ["ÉLEVÉ", "#FF7A3D"] : v >= 25 ? ["MODÉRÉ", "#FFAF2E"] : ["FAIBLE", "#43E08B"]; };

  var SEED = null, DB = null, AUDIT = [], UNDO = null, TESTS = [], IVIC = {}, MIDX = {}, BIDX = {}, EIDX = {}, IMPORT = null, FIXES = 0, LASTSAVE = 0, DIRTY = false, PENDING = 0;
  var META = { counts: {}, links: 0, corr: 0, integ: { err: [], ok: true, pct: 100 }, size: 0, byBrand: {}, regions: {} };
  var MODE = null, TIER = null, REG = null, CH = null;
  var S = {
    view: "bord", sel: { b: "", m: "", e: "" }, f: { q: "", fuel: [], region: "", y: [2017, YMAX], sort: "brand" }, shown: 48,
    tech: { tab: "faults", q: "", sev: "", brand: "", model: "", phase: "", dom: "", km: "", region: "" },
    adm: { tab: "files", q: "", mega: "" }, calc: { km: 60000, year: 2021, sev: 1 }, drawer: null, omni: { q: "", hits: [], idx: -1 }
  };
  window.MD_STATE = S;
  var isAdmin = function () { return MODE === "admin"; };
  var isTier = function () { return MODE === "tier"; };

  function regLoad() { var raw = STORE.get(AKEY), r = null; if (raw) safe("reg", function () { r = JSON.parse(raw); }, null); if (!r || !r.users) r = { users: [], live: false, rev: 0, log: [] }; REG = r; return r; }
  function regSave() { STORE.set(AKEY, JSON.stringify(REG)); bcast({ t: "reg" }); }
  function bcast(m) { try { if (CH) CH.postMessage(m); } catch (e) {} }
  function regLog(a) { REG.log.unshift({ ts: Date.now(), a: a }); if (REG.log.length > 60) REG.log.pop(); }
  function pendingCount() { return REG.users.filter(function (u) { return u.status === "pending"; }).length; }
  function tierUser() { if (!TIER) return null; for (var i = 0; i < REG.users.length; i++) if (REG.users[i].id === TIER) return REG.users[i]; return null; }
  function applyTierSnapshot() { var raw = STORE.get(PKEY); if (!raw) return false; return safe("pub", function () { var d = JSON.parse(raw); if (d && d.db && d.db.engines && d.db.engines.length) { DB = d.db; FIXES += sanitize(DB); recompute(); return true; } return false; }, false); }

  function mkEng(n, mid, code, fam, label, fuel, disp, hp, nm, y0, y1, gb) {
    var cyl = fuel === "b" ? "ÉLEC" : (disp >= 6000 ? "W12+" : (disp > 3400 ? "V8+" : (disp > 2400 ? "6 cyl." : (disp < 1100 ? "L3" : "L4"))));
    return { id: "E" + String(n).padStart(4, "0"), m: [mid], code: code, fam: fam, label: label, fuel: fuel, disp: disp, hp: hp, nm: nm, kw: Math.round(hp * 0.7355), y: [y0, y1], gb: gb, norm: fuel === "b" ? "ZE" : (y0 >= 2024 ? "Euro 6e" : (y0 >= 2020 ? "Euro 6d" : "Euro 6")), cyl: cyl, asp: fuel === "b" ? "—" : "Turbo", inj: fuel === "b" ? "—" : (fuel === "d" ? "Common Rail" : "Injection directe") };
  }
  function build(R) {
    var D = { brands: [], models: [], engines: [], faults: [], tsb: [] };
    R.br.forEach(function (b) { D.brands.push({ id: b[0], n: b[1], pays: b[2], grp: b[3], region: b[4] || regionOf(b[2]) }); });
    Object.keys(R.md).forEach(function (bid) { R.md[bid].forEach(function (m) { D.models.push({ id: bid + "-" + slug(m[0]), b: bid, n: m[0], y: [m[1], m[2]], seg: SEGS[m[3]] || "Compacte", phase: m[4] || 1 }); }); });
    var n = 0;
    D.models.forEach(function (m) { (R.me[m.id] || []).forEach(function (e) { n++; D.engines.push(mkEng(n, m.id, e[0], e[1], e[2], nfuel(e[3]), e[4], e[5], e[6], e[8], e[9], e[7])); }); });
    R.ft.forEach(function (f, i) { D.faults.push({ id: "F" + String(i + 1).padStart(3, "0"), t: f[0], fam: split(f[1]), mt: split(f[2]), ph: split(f[3]), sev: nsev(f[4]), freq: nfreq(f[5]), y: [+f[6], +f[7]], km: [+f[8], +f[9]], sym: split(f[10]), cause: f[11], fix: f[12], cost: [+f[13], +f[14]], status: f[15], dom: f[16] || "Moteur", fuel: "" }); });
    R.ts.forEach(function (t, i) { D.tsb.push({ id: "T" + String(i + 1).padStart(3, "0"), ref: t[0], b: split(t[1]), fam: split(t[2]), mt: split(t[3]), ph: split(t[4]), t: t[5], date: t[6], cat: t[7], sev: nsev(t[8]), sum: t[9], act: t[10], dom: t[11] || t[7] }); });
    return D;
  }
  function sanitize(D) {
    var fx = 0;["brands", "models", "engines", "faults", "tsb"].forEach(function (k) { if (!Array.isArray(D[k])) { D[k] = []; fx++; } });
    var bs = {}, ms = {}; D.brands.forEach(function (b) { bs[b.id] = 1; if (!b.region) { b.region = regionOf(b.pays); fx++; } });
    D.models = D.models.filter(function (m) { if (!m || !m.n || !bs[m.b]) { fx++; return false; } ms[m.id] = 1; m.phase = m.phase || 1; return true; });
    var es = {}; D.engines = D.engines.filter(function (e) { if (!e || !e.code) { fx++; return false; } e.m = (e.m || []).filter(function (x) { return ms[x]; }); if (!e.m.length) { fx++; return false; } if (es[e.id]) { e.id = uid("E"); fx++; } es[e.id] = 1; e.fuel = nfuel(e.fuel); e.hp = +e.hp || 100; return true; });
    var fs = {}; D.faults = D.faults.filter(function (f) { if (!f || !f.t) { fx++; return false; } if (fs[f.id]) { f.id = uid("F"); fx++; } fs[f.id] = 1; var s = nsev(f.sev); if (s !== f.sev) fx++; f.sev = s; var q = nfreq(f.freq); if (q !== f.freq) fx++; f.freq = q; f.fam = split(f.fam); f.mt = split(f.mt); f.ph = split(f.ph); f.sym = split(f.sym); f.cost = Array.isArray(f.cost) ? f.cost : [0, 0]; f.y = Array.isArray(f.y) ? f.y : [2017, YMAX]; f.km = Array.isArray(f.km) ? f.km : [0, 200000]; f.dom = f.dom || "Moteur"; return true; });
    var ts = {}; D.tsb = D.tsb.filter(function (t) { if (!t || !t.t) { fx++; return false; } if (ts[t.id]) { t.id = uid("T"); fx++; } ts[t.id] = 1; var s = nsev(t.sev); if (s !== t.sev) fx++; t.sev = s; t.b = split(t.b).filter(function (x) { return bs[x]; }); t.fam = split(t.fam); t.mt = split(t.mt); t.ph = split(t.ph); t.date = String(t.date || "2026-01").slice(0, 7); t.cat = t.cat || "Moteur"; t.dom = t.dom || t.cat; return true; });
    return fx;
  }
  function reindex() { MIDX = {}; BIDX = {}; EIDX = {}; DB.models.forEach(function (m) { MIDX[m.id] = m; }); DB.brands.forEach(function (b) { BIDX[b.id] = b; }); DB.engines.forEach(function (e) { EIDX[e.id] = e; }); }
  function brandOf(e) { var m = MIDX[e.m[0]]; return m ? BIDX[m.b] : null; }
  function modelOf(e) { return MIDX[e.m[0]]; }
  function engName(e) { var m = modelOf(e), b = brandOf(e); return ((b ? b.n : "") + " " + (m ? m.n : "") + " — " + e.label).trim(); }
  function tokHit(list, name) { if (!list || !list.length) return false; var n = nk(name); for (var i = 0; i < list.length; i++) { var t = nk(list[i]); if (t === "*") return true; if (t && n.indexOf(t) > -1) return true; } return false; }
  function fApply(f, e, m) { var ok = (f.fam || []).indexOf(e.fam) > -1 || tokHit(f.mt, m.n); if (!ok) return false; if (f.ph && f.ph.length && f.ph.indexOf("*") < 0 && f.ph.indexOf(String(m.phase)) < 0) return false; return true; }
  function tApply(t, e, m) { var ok = (t.fam || []).indexOf(e.fam) > -1 || tokHit(t.mt, m.n) || (t.b || []).indexOf(m.b) > -1; if (!ok) return false; if (t.ph && t.ph.length && t.ph.indexOf("*") < 0 && t.ph.indexOf(String(m.phase)) < 0) return false; return true; }
  function faultsFor(e) { var m = modelOf(e); if (!m) return []; var out = []; DB.faults.forEach(function (f) { if (!fApply(f, e, m)) return; var g = clone(f); g.active = ov(f.y, e.y) && ov(f.y, m.y); out.push(g); }); out.sort(function (a, b) { var d = (b.active ? 1 : 0) - (a.active ? 1 : 0); return d !== 0 ? d : (SV[b.sev].w - SV[a.sev].w); }); return out; }
  function tsbFor(e) { var m = modelOf(e); if (!m) return []; var out = []; DB.tsb.forEach(function (t) { if (tApply(t, e, m)) out.push(t); }); out.sort(function (a, b) { return b.date.localeCompare(a.date); }); return out; }
  function isRecall(t) { return t.cat === "Rappel" || /^RPL-/.test(t.ref); }
  function ivi(e) { if (IVIC[e.id] !== undefined) return IVIC[e.id]; var s = 0, fs = faultsFor(e); for (var i = 0; i < fs.length; i++) { var w = SV[fs[i].sev].w * (FQ[fs[i].freq] || 1); s += fs[i].active ? w : w * 0.25; } s = clamp(Math.round(s), 0, 100); IVIC[e.id] = s; return s; }
  function enginesForFault(f) { return DB.engines.filter(function (e) { var m = modelOf(e); return m && fApply(f, e, m); }); }
  function enginesForTsb(t) { return DB.engines.filter(function (e) { var m = modelOf(e); return m && tApply(t, e, m); }); }
  function integrity() { var err = [], mi = {}, bi = {}, du = 0; DB.models.forEach(function (m) { mi[m.id] = 1; }); DB.brands.forEach(function (b) { bi[b.id] = 1; }); FILES.forEach(function (f) { var s = {}; DB[f[0]].forEach(function (x) { if (s[x.id]) du++; s[x.id] = 1; }); }); if (du) err.push(du + " id dupliqué(s)"); DB.models.forEach(function (m) { if (!bi[m.b]) err.push("marque inconnue " + m.b); }); DB.engines.forEach(function (e) { e.m.forEach(function (i) { if (!mi[i]) err.push("moteur orphelin " + e.id); }); }); DB.faults.forEach(function (f) { if (!SV[f.sev]) err.push("sévérité " + f.sev); }); return { err: err, ok: !err.length, pct: err.length ? Math.max(0, 100 - err.length * 7) : 100 }; }
  function recompute() { IVIC = {}; reindex(); var links = 0, corr = 0, bb = {}, doms = {}, fams = {}, regs = {}, i; for (i = 0; i < DB.engines.length; i++) { var e = DB.engines[i], m = MIDX[e.m[0]]; fams[e.fam] = 1; links += e.m.length; if (m) bb[m.b] = (bb[m.b] || 0) + 1; corr += faultsFor(e).length + tsbFor(e).length; } DB.brands.forEach(function (b) { regs[b.region] = (regs[b.region] || 0) + 1; }); DB.faults.forEach(function (f) { links += f.fam.length; doms[f.dom] = 1; }); DB.tsb.forEach(function (t) { links += t.b.length + t.fam.length; doms[t.dom] = 1; }); META = { counts: { b: DB.brands.length, m: DB.models.length, e: DB.engines.length, f: DB.faults.length, t: DB.tsb.length, rc: DB.tsb.filter(isRecall).length, fam: Object.keys(fams).length, dom: Object.keys(doms).length }, links: links, corr: corr, integ: integrity(), size: Math.round(JSON.stringify(DB).length / 1024), byBrand: bb, regions: regs }; }

  function svcFor(e) { var list = window.MD_RAW.svc, i, j; for (i = 0; i < list.length; i++) { var s = list[i]; if (s.fams.indexOf("*") > -1) continue; for (j = 0; j < s.fams.length; j++) if (s.fams[j] === e.fam) return s; } for (i = 0; i < list.length; i++) if (list[i].fams.indexOf("*") > -1 && list[i].fuel === e.fuel) return list[i]; return list[0]; }
  function buildPlan(e, m, b) {
    var s = svcFor(e), base = s.base, months = s.months, visits = [], km, i, j, annual = Math.max(8000, Math.round(base * (12 / Math.max(1, months))));
    for (km = base; km <= KMMAX; km += base) {
      var ops = [], ctrl = [];
      for (i = 0; i < s.items.length; i++) { var it = s.items[i]; if (it[1] > 0) { if (km % it[1] === 0) ops.push(it[0]); } else if (it[2] > 0) { var due = Math.round(annual * it[2] / 12); if (due > 0 && km % Math.max(base, Math.round(due / base) * base) === 0) ops.push(it[0] + " (échéance " + it[2] + " mois)"); } }
      if (s.dist[1] > 0 && km >= s.dist[1] && km - s.dist[1] < base) ops.push(s.dist[0] + " — REMPLACEMENT (" + fmt(s.dist[1]) + " km / " + s.dist[2] + " mois)");
      if (!ops.length) ops.push("Révision intermédiaire constructeur");
      for (j = 0; j < s.controls.length; j++) ctrl.push(s.controls[j]);
      visits.push({ km: km, mo: Math.round(km / annual * 12), ops: ops, ctrl: ctrl });
    }
    if (s.dist[1] > KMMAX) visits.push({ km: s.dist[1], mo: s.dist[2], ops: [s.dist[0] + " — REMPLACEMENT"], ctrl: ["Contrôle tension et guides"] });
    visits.sort(function (a, b2) { return a.km - b2.km; });
    return { svc: s, visits: visits, base: base, months: months, annual: annual, brand: b, model: m, engine: e };
  }
  function planHTML(pl, compact) {
    var s = pl.svc, e = pl.engine, m = pl.model, b = pl.brand, h = "", i, j;
    h += "<div class='selcard'><h3>" + ic("car", "width:16px;height:16px") + " " + esc((b ? b.n : "") + " " + (m ? m.n : "")) + " · " + esc(e.label) + "</h3>";
    h += "<div class='sg'><div class='sp'><span>Phase</span><b class='hl'>" + (m ? m.phase : "—") + "</b></div><div class='sp'><span>Code moteur</span><b class='hl'>" + esc(e.code) + "</b></div><div class='sp'><span>Puissance</span><b class='hl'>" + e.hp + " ch</b></div><div class='sp'><span>Boîte</span><b class='hl'>" + esc(e.gb) + "</b></div><div class='sp'><span>Production</span><b class='hl'>" + e.y[0] + "-" + e.y[1] + "</b></div><div class='sp'><span>Intervalle</span><b class='hl'>" + fmt(pl.base) + " km / " + pl.months + " mois</b></div></div></div>";
    h += "<div class='oil'><div class='oc'><span>" + ic("oil", "width:11px;height:11px") + "HUILE</span><b>" + esc(s.oil[0]) + "</b><p>" + (s.oil[1] ? s.oil[1] + " L · " : "") + esc(e.fam) + "</p></div>";
    h += "<div class='oc b'><span>" + ic("piston", "width:11px;height:11px") + "DISTRIBUTION</span><b>" + esc(s.dist[0]) + "</b><p>" + (s.dist[1] ? fmt(s.dist[1]) + " km" + (s.dist[2] ? " / " + s.dist[2] + " mois" : "") : "Chaîne — sans remplacement programmé") + "</p></div></div>";
    var fl = s.fluids;
    h += "<div class='sg' style='margin-bottom:12px'>" + [["Liquide de freins", fl[0]], ["Refroidissement", fl[1]], ["Couple roues", fl[2] + " Nm"], ["Pression pneus", fl[3] + " / " + fl[4] + " bar"], ["Fluide clim", fl[5]], ["Batterie 12V", fl[6]]].map(function (r) { return "<div class='sp'><span>" + esc(r[0]) + "</span><b class='hl'>" + esc(r[1]) + "</b></div>"; }).join("") + "</div>";
    h += "<div class='tw' style='max-height:" + (compact ? "380px" : "none") + ";overflow:auto'><table class='vtab'><thead><tr><th>Kilométrage</th><th>Échéance</th><th>Interventions</th><th>Contrôles systématiques</th></tr></thead><tbody>";
    for (i = 0; i < pl.visits.length; i++) { var v = pl.visits[i]; h += "<tr><td class='km'>" + fmt(v.km) + " km</td><td class='ct'>" + v.mo + " mois</td><td><ul>"; for (j = 0; j < v.ops.length; j++) h += "<li>" + esc(v.ops[j]) + "</li>"; h += "</ul></td><td class='ct'>" + esc(v.ctrl.join(" · ")) + "</td></tr>"; }
    h += "</tbody></table></div><p class='dim mono' style='font-size:9.5px;margin-top:9px'>PLAN COMPLET JUSQU'À 200 000 KM — ESTIMATION INGÉNIEUR, CARNET CONSTRUCTEUR PRIORITAIRE.</p>";
    return h;
  }
  function dueHTML(pl) {
    var km = clamp(+S.calc.km || 0, 0, 400000), yr = clamp(+S.calc.year || 2021, 2005, YMAX), sev = +S.calc.sev || 1;
    var now = new Date(), age = Math.max(1, (now.getFullYear() - yr) * 12 + now.getMonth()), rows = [], s = pl.svc, i;
    var base = Math.round(pl.base * sev), next = Math.max(base, Math.ceil((km + 1) / base) * base), rem = next - km;
    rows.push({ op: "Révision " + fmt(next) + " km", u: rem / base, badge: rem <= 1500 ? "ÉCHÉANCE PROCHE" : (rem <= base * 0.2 ? "BIENTÔT" : "DANS " + fmt(rem) + " KM"), cls: rem <= 1500 ? "now" : (rem <= base * 0.2 ? "soon" : "ok"), pct: clamp((base - rem) / base * 100, 0, 100), detail: "Prochaine révision à " + fmt(next) + " km" });
    for (i = 0; i < s.items.length; i++) { var it = s.items[i]; if (it[1] <= 0 || it[1] <= base) continue; var ik = Math.round(it[1] * sev), nx = Math.max(ik, Math.ceil((km + 1) / ik) * ik), rm = nx - km; rows.push({ op: it[0], u: rm / ik, badge: rm <= 1500 ? "À FAIRE" : (rm <= ik * 0.2 ? "BIENTÔT" : "DANS " + fmt(rm) + " KM"), cls: rm <= 1500 ? "now" : (rm <= ik * 0.2 ? "soon" : "ok"), pct: clamp((ik - rm) / ik * 100, 0, 100), detail: "Échéance " + fmt(nx) + " km" }); }
    if (s.dist[1] > 0) { var dk = s.dist[1], dr = dk - km; rows.push({ op: "Distribution : " + s.dist[0], u: Math.max(0, dr) / dk, badge: dr <= 0 ? "DÉPASSÉ" : (dr <= 10000 ? "À PLANIFIER" : "DANS " + fmt(Math.max(0, dr)) + " KM"), cls: dr <= 0 ? "now" : (dr <= 10000 ? "soon" : "ok"), pct: clamp(km / dk * 100, 0, 100), detail: "Remplacement à " + fmt(dk) + " km / " + s.dist[2] + " mois" }); }
    var bf = Math.ceil(age / 24) * 24, br = bf - age;
    rows.push({ op: "Liquide de freins", u: br / 24, badge: br <= 1 ? "À FAIRE" : (br <= 3 ? "BIENTÔT" : "DANS " + br + " MOIS"), cls: br <= 1 ? "now" : (br <= 3 ? "soon" : "ok"), pct: clamp((24 - br) / 24 * 100, 0, 100), detail: "Échéance temporelle 24 mois" });
    rows.sort(function (a, b) { return a.u - b.u; });
    var h = ""; rows.forEach(function (r) { var dc = r.cls === "now" ? "#FF4D5E" : (r.cls === "soon" ? "#FFAF2E" : "#43E08B"); h += "<div class='drow' style='--dc:" + dc + "'><div class='dr1'><b>" + esc(r.op) + "</b><span class='dbadge " + r.cls + "'>" + r.badge + "</span></div><div class='pb'><i style='width:" + Math.round(r.pct) + "%'></i></div><div class='dim mono' style='font-size:9.5px;margin-top:5px'>" + esc(r.detail) + "</div></div>"; });
    return h;
  }

  function saveNow() { if (!isAdmin()) return; safe("save", function () { STORE.set(KEY, JSON.stringify({ v: 81, db: DB, audit: AUDIT.slice(-60), prefs: PREF, wp: WP.P, ts: Date.now() })); LASTSAVE = Date.now(); DIRTY = false; updStor(); }, null); }
  var save = deb(saveNow, 350); window.MD_saveState = save;
  function markDirty() { if (!isAdmin()) return; DIRTY = true; save(); }
  function audit(t, m) { AUDIT.push({ ts: Date.now(), type: t, msg: m }); if (AUDIT.length > 120) AUDIT = AUDIT.slice(-120); }
  function snapshot(l) { UNDO = { label: l, db: clone(DB) }; }
  function doUndo() { if (!UNDO) return; DB = UNDO.db; var l = UNDO.label; UNDO = null; mutate("imp", "Annulation : " + l); toast("ok", "Action annulée"); }
  function publish(auto) { if (!isAdmin()) return; REG.rev = (REG.rev || 0) + 1; STORE.set(PKEY, JSON.stringify({ ts: Date.now(), rev: REG.rev, db: DB })); regLog("Diffusion rev " + REG.rev + (auto ? " (auto)" : "")); regSave(); bcast({ t: "pub", rev: REG.rev }); if (!auto) toast("ok", "Diffusé aux tiers", "Révision " + REG.rev + " — " + fmt(META.counts.e) + " motorisations."); }
  function mutate(t, m) { FIXES += sanitize(DB); recompute(); audit(t, m); markDirty(); if (REG.live && isAdmin()) publish(true); updateMeta(); render(); if (S.drawer) renderDrawer(); }

  var sevTag = function (s) { return "<span class='sev " + (s === "modérée" ? "mode" : esc(s)) + "'>" + esc(s) + "</span>"; };
  var fuelTag = function (f) { var x = FU[f] || { l: f, c: "#9FB2C8" }; return "<span class='fuel' style='--fc:" + x.c + "'>" + x.l + "</span>"; };
  var iviPill = function (v) { var l = IVL(v); return "<span class='ivp' style='--ic:" + l[1] + "'><i></i>IVI " + v + "</span>"; };
  function corrRow(e) { var F = FU[e.fuel] || { c: "#FFD60A" }, b = brandOf(e), m = modelOf(e); return "<button class='corr' style='--fc:" + F.c + "' data-act='openEng' data-id='" + e.id + "'><div style='min-width:0'><b>" + esc((b ? b.n : "") + " " + (m ? m.n : "")) + "</b><small>" + esc(e.label) + " · " + esc(e.code) + " · " + e.y[0] + "-" + e.y[1] + "</small></div><span class='hp'>" + e.hp + "<small style='font-size:9px'> ch</small></span></button>"; }
  function faultCard(f, hist, full) { var c = SV[f.sev].c, h = ""; h += "<div class='fcard' style='--sc:" + c + ";" + (hist ? "opacity:.62" : "") + "'><div class='fh'><b>" + esc(f.t) + "</b>" + sevTag(f.sev) + "</div>"; h += "<div class='tags'><span class='tag'>" + esc(f.dom) + "</span><span class='tag'>" + f.y[0] + "-" + f.y[1] + "</span><span class='tag'>" + fmt(f.km[0]) + "–" + fmt(f.km[1]) + " km</span><span class='tag'>fréq. " + esc(f.freq) + "</span>"; if (f.ph && f.ph.length) h += "<span class='tag'>phase " + esc(f.ph.join("/")) + "</span>"; if (hist) h += "<span class='tag'>HORS PÉRIODE</span>"; h += "<span class='tag' style='color:#25D4EE'>" + esc(f.status) + "</span></div>"; if (f.sym.length) { h += "<div class='tags'>"; f.sym.forEach(function (s) { h += "<span class='tag'>" + ic("act", "width:10px;height:10px;color:#FFAF2E") + esc(s) + "</span>"; }); h += "</div>"; } h += "<p><b>Cause :</b> " + esc(f.cause) + "</p><p><b>Action :</b> " + esc(f.fix) + "</p>"; h += "<div class='cost'>" + ic("euro", "width:13px;height:13px") + (f.cost[1] === 0 ? "Prise en charge / campagne" : fmt(f.cost[0]) + " – " + fmt(f.cost[1]) + " €") + "</div>"; if (!full) h += "<div style='margin-top:8px'><button class='btn xs ghost' data-act='openFault' data-id='" + f.id + "'>" + ic("chev", "width:11px;height:11px") + "Détail & motorisations</button></div>"; return h + "</div>"; }
  function tsbCard(t, full) { var rc = isRecall(t), h = ""; h += "<div class='tsb" + (rc ? " rc" : "") + "'><div style='display:flex;gap:7px;align-items:center;flex-wrap:wrap'><span class='ref'>" + esc(t.ref) + "</span>" + sevTag(t.sev); h += "<span class='tag'>" + (rc ? ic("bell", "width:10px;height:10px;color:#FFD60A") : "") + esc(t.cat) + "</span><span class='tag mono'>" + esc(t.date) + "</span>"; if (t.ph && t.ph.length) h += "<span class='tag'>phase " + esc(t.ph.join("/")) + "</span>"; h += "</div><b>" + esc(t.t) + "</b><p>" + esc(t.sum) + "</p><div class='act'><b style='font-size:11px;color:" + (rc ? "#FFD60A" : "#4D8DFF") + "'>ACTION :</b> " + esc(t.act) + "</div>"; if (!full) h += "<div style='margin-top:8px'><button class='btn xs ghost' data-act='openTsb' data-id='" + t.id + "'>" + ic("chev", "width:11px;height:11px") + "Périmètre</button></div>"; return h + "</div>"; }
  function mountAnim(sc) { $$(".brow .bt i", sc).forEach(function (i) { i.style.width = i.dataset.w; }); }

  function openDrawer(type, id, push) { if (S.drawer && push) S.drawer.hist.push({ type: S.drawer.type, id: S.drawer.id, tab: S.drawer.tab }); else if (!S.drawer) S.drawer = { hist: [] }; S.drawer.type = type; S.drawer.id = id; S.drawer.tab = type === "engine" ? "fiche" : "main"; renderDrawer(); document.body.classList.add("lock"); requestAnimationFrame(function () { $("#dr").classList.add("on"); }); beep("open"); }
  function closeDrawer() { var r = $("#dr"); if (!r.innerHTML) return; r.classList.remove("on"); S.drawer = null; if (!modalOpenFn()) document.body.classList.remove("lock"); setTimeout(function () { if (!S.drawer) r.innerHTML = ""; }, 320); beep("close"); }
  function renderDrawer() {
    if (!S.drawer) return; var d = S.drawer, head = "", tabs = "", body = "", i;
    if (d.type === "engine") {
      var e = EIDX[d.id]; if (!e) { closeDrawer(); return; }
      var b = brandOf(e), m = modelOf(e), F = FU[e.fuel] || { c: "#FFD60A" }, fs = faultsFor(e), ts = tsbFor(e), rc = ts.filter(isRecall), v = ivi(e), L = IVL(v), pl = buildPlan(e, m, b);
      head = "<div class='dh' style='--fc:" + F.c + "'><div class='row'>" + (d.hist.length ? "<button class='tb' data-act='drback'>" + ic("back") + "</button>" : "");
      head += "<span class='tag mono'>" + esc(b ? b.n : "—") + "</span>" + fuelTag(e.fuel) + "<span class='tag'>" + esc(m ? m.n : "") + " · phase " + (m ? m.phase : 1) + "</span>";
      if (rc.length) head += "<span class='tag' style='color:#FFD60A'>" + ic("bell", "width:10px;height:10px") + rc.length + " rappel(s)</span>";
      head += "<button class='tb x' data-act='drclose'>" + ic("x") + "</button></div><h2>" + esc(e.label) + "</h2><div class='sub mono'>" + esc(e.code) + " · " + e.y[0] + "-" + e.y[1] + " · " + e.hp + " ch / " + e.kw + " kW · " + e.nm + " Nm</div></div>";
      var dt = [["fiche", "Fiche", "piston"], ["pannes", "Pannes", "alert", fs.length], ["tsb", "TSB", "file", ts.length], ["plan", "Entretien", "wrench"], ["corr", "Corrélations", "spark"]];
      tabs = "<div class='dtabs'>"; dt.forEach(function (t) { tabs += "<button class='dt " + (d.tab === t[0] ? "on" : "") + "' data-act='drtab' data-t='" + t[0] + "'>" + ic(t[2], "width:13px;height:13px") + t[1] + (t[3] !== undefined ? "<span class='n'>" + t[3] + "</span>" : "") + "</button>"; }); tabs += "</div>";
      if (d.tab === "fiche") {
        var rows = [["Code moteur", e.code], ["Famille", e.fam], ["Cylindrée", e.disp ? fmt(e.disp) + " cm³" : "—"], ["Architecture", e.cyl], ["Puissance", e.hp + " ch / " + e.kw + " kW"], ["Couple", e.nm + " Nm"], ["Suralimentation", e.asp], ["Injection", e.inj], ["Norme", e.norm], ["Boîte", e.gb], ["Production", e.y[0] + " → " + e.y[1]], ["Énergie", FU[e.fuel].l], ["Modèle", m ? m.n : "—"], ["Phase modèle", m ? m.phase : "—"], ["Segment", m ? m.seg : "—"], ["Région", b ? REGIONS[b.region] : "—"], ["IVI", v + " / 100 · " + L[0]]];
        body = "<div class='sg'>"; rows.forEach(function (r) { body += "<div class='sp'><span>" + esc(r[0]) + "</span><b class='hl'>" + esc(r[1]) + "</b></div>"; }); body += "</div>";
        body += "<div style='display:flex;gap:7px;flex-wrap:wrap;margin-top:13px'><button class='btn sm pri' data-act='selEng' data-id='" + e.id + "'>" + ic("wrench") + "Plan d'entretien précis</button>";
        if (isAdmin()) body += "<button class='btn sm ghost' data-act='expEng' data-id='" + e.id + "'>" + ic("dl") + "Exporter</button>";
        body += "</div>";
      } else if (d.tab === "pannes") body = fs.length ? fs.map(function (f) { return faultCard(f, !f.active, false); }).join("") : "<div class='empty'>" + ic("check") + "<p>Aucune panne référencée.</p></div>";
      else if (d.tab === "tsb") body = ts.length ? ts.map(function (t) { return tsbCard(t, false); }).join("") : "<div class='empty'>" + ic("file") + "<p>Aucun bulletin corrélé.</p></div>";
      else if (d.tab === "plan") body = planHTML(pl, true);
      else { var same = DB.engines.filter(function (x) { return x.fam === e.fam && x.id !== e.id; }); body = "<div class='card panel'><h3>" + ic("spark") + "Famille " + esc(e.fam) + " — " + same.length + " autre(s)</h3>" + (same.length ? same.slice(0, 24).map(corrRow).join("") : "<p class='dim'>Première motorisation de cette famille.</p>") + "</div>"; }
    } else if (d.type === "fault") {
      var f = null; for (i = 0; i < DB.faults.length; i++) if (DB.faults[i].id === d.id) f = DB.faults[i];
      if (!f) { closeDrawer(); return; } var af = enginesForFault(f);
      head = "<div class='dh' style='--fc:" + SV[f.sev].c + "'><div class='row'>" + (d.hist.length ? "<button class='tb' data-act='drback'>" + ic("back") + "</button>" : "") + sevTag(f.sev) + "<span class='tag'>" + esc(f.dom) + "</span><button class='tb x' data-act='drclose'>" + ic("x") + "</button></div><h2>" + esc(f.t) + "</h2><div class='sub mono'>" + f.y[0] + "-" + f.y[1] + " · " + fmt(f.km[0]) + "–" + fmt(f.km[1]) + " km</div></div>";
      body = faultCard(f, false, true) + "<div class='card panel' style='margin-top:12px'><h3>" + ic("car") + "Motorisations corrélées<span class='chip'>" + af.length + "</span></h3>" + (af.length ? af.slice(0, 30).map(corrRow).join("") : "<p class='dim'>Aucune.</p>") + (af.length > 30 ? "<p class='dim mono' style='font-size:10px'>+ " + (af.length - 30) + " autres…</p>" : "") + "</div>";
    } else {
      var t = null; for (i = 0; i < DB.tsb.length; i++) if (DB.tsb[i].id === d.id) t = DB.tsb[i];
      if (!t) { closeDrawer(); return; } var at = enginesForTsb(t);
      head = "<div class='dh' style='--fc:" + (isRecall(t) ? "#FFD60A" : "#4D8DFF") + "'><div class='row'>" + (d.hist.length ? "<button class='tb' data-act='drback'>" + ic("back") + "</button>" : "") + "<span class='tag mono'>" + esc(t.ref) + "</span>" + sevTag(t.sev) + "<button class='tb x' data-act='drclose'>" + ic("x") + "</button></div><h2>" + esc(t.t) + "</h2><div class='sub mono'>" + esc(t.date) + " · " + esc(t.cat) + "</div></div>";
      body = tsbCard(t, true) + "<div class='card panel' style='margin-top:12px'><h3>" + ic("car") + "Périmètre corrélé<span class='chip'>" + at.length + "</span></h3>" + (at.length ? at.slice(0, 30).map(corrRow).join("") : "<p class='dim'>Aucun.</p>") + "</div>";
    }
    $("#dr").innerHTML = "<div class='sc' data-act='drclose'></div><aside class='dw'>" + head + tabs + "<div class='db'>" + body + "</div><div class='dfoot'>SYNTHÈSE INGÉNIEUR — CONFIRMER AU VIN</div></aside>"; mountAnim($("#dr"));
  }

  var SYN = {
    puretech: ["eb2"], hdi: ["dv5", "dw10"], bluehdi: ["dv5", "dw10"], tsi: ["ea211", "ea888", "dpca"], tfsi: ["ea888", "dkna", "dnwa"], tdi: ["ea288", "dsua"], tce: ["h4dt", "h5ht", "hr12"], dci: ["k9k", "m9r", "r9m"],
    courroie: ["courroie", "distribution"], chaine: ["chaine", "aac"], adblue: ["adblue", "scr", "nox"], scr: ["scr", "nox"], egr: ["egr"], fap: ["fap", "dpf"], turbo: ["turbo"], rappel: ["rappel"], tsb: ["tsb", "bulletin"], panne: ["panne"],
    eat8: ["eat8"], eat6: ["eat6"], dsg: ["dq200", "dq381"], zf8: ["zf8"], cvt: ["cvt", "xtr", "lineartronic"], pdk: ["pdk"], dct: ["dct"], frein: ["frein", "freinage"], clim: ["clim"], batterie: ["batterie", "12v"], ecran: ["ecran", "bsi"],
    france: ["renault", "peugeot", "citroen", "ds", "dacia", "alpine", "bugatti"], europe: ["vw", "audi", "bmw", "mercedes", "volvo", "fiat", "alfa", "porsche"], asie: ["toyota", "honda", "nissan", "mazda", "hyundai", "kia", "suzuki", "subaru"], chine: ["byd", "mg", "chery", "geely", "nio", "xpeng", "zeekr", "haval", "xiaomi"], amerique: ["ford", "tesla", "chevrolet", "jeep", "gmc", "ram", "cadillac"],
    p20e8: ["adblue", "scr"], p204f: ["adblue", "scr"], p0420: ["catalyseur"], p0300: ["rates", "allumage"], p0087: ["pression", "carburant"], p0299: ["turbo"], p0401: ["egr"], p2002: ["fap", "dpf"]
  };
  function score(qn, hay) { var h = nk(hay); if (!qn) return 0; if (h === qn) return 120; if (h.indexOf(qn) === 0) return 95; if (h.indexOf(qn) > -1) return 70; var i = 0, j = 0; while (i < qn.length && j < h.length) { if (qn[i] === h[j]) i++; j++; } return i === qn.length ? 34 : 0; }
  function omniSearch(q) {
    var qn = nk(q), raw = String(q).toLowerCase().split(/[\s,;]+/).filter(Boolean), syn = [], i, j;
    raw.forEach(function (w) { var k = nk(w); if (SYN[k]) syn = syn.concat(SYN[k]); });
    var wantR = qn.indexOf("rappel") > -1, wantT = qn.indexOf("tsb") > -1 || qn.indexOf("bulletin") > -1, wantF = qn.indexOf("panne") > -1;
    var hits = [], famSet = {}, brandSet = {}, modelSet = {};
    DB.engines.forEach(function (e) {
      var b = brandOf(e), m = modelOf(e), hay = [(b ? b.n : ""), (m ? m.n : ""), "phase " + (m ? m.phase : ""), e.code, e.fam, e.label, (b ? b.pays : ""), (b ? REGIONS[b.region] : "")].join(" ");
      var sc = score(qn, hay);
      if (!sc && syn.length) for (j = 0; j < syn.length; j++) if (nk(e.fam).indexOf(nk(syn[j])) > -1 || nk(e.code).indexOf(nk(syn[j])) > -1 || nk(e.gb).indexOf(nk(syn[j])) > -1) { sc = 62; break; }
      if (sc > 0) { famSet[e.fam] = 1; if (m) { brandSet[m.b] = 1; modelSet[nk(m.n)] = 1; } hits.push({ kind: "engine", id: e.id, score: sc + 6, title: engName(e), sub: e.code + " · " + e.hp + " ch · phase " + (m ? m.phase : 1) + " · " + (b ? REGIONS[b.region] : ""), color: FU[e.fuel].c, badge: "MOTEUR" }); }
    });
    DB.faults.forEach(function (f) {
      var hay = f.t + " " + f.fam.join(" ") + " " + f.mt.join(" ") + " " + f.cause + " " + f.fix + " " + f.sym.join(" ") + " " + f.dom;
      var sc = score(qn, hay);
      if (!sc) for (j = 0; j < f.fam.length; j++) if (famSet[f.fam[j]]) { sc = 66; break; }
      if (!sc && syn.length) for (j = 0; j < syn.length; j++) if (nk(hay).indexOf(nk(syn[j])) > -1) { sc = 58; break; }
      if (sc > 0) hits.push({ kind: "fault", id: f.id, score: sc + (wantF ? 26 : 0) + SV[f.sev].w * 0.6, title: f.t, sub: f.sev + " · " + f.dom + " · " + fmt(f.km[0]) + "-" + fmt(f.km[1]) + " km", color: SV[f.sev].c, badge: "PANNE" });
    });
    DB.tsb.forEach(function (t) {
      var rc = isRecall(t), hay = t.t + " " + t.ref + " " + t.fam.join(" ") + " " + t.mt.join(" ") + " " + t.sum + " " + t.act + " " + t.cat;
      var sc = score(qn, hay);
      if (!sc) for (j = 0; j < t.fam.length; j++) if (famSet[t.fam[j]]) { sc = 64; break; }
      if (!sc) for (j = 0; j < t.b.length; j++) if (brandSet[t.b[j]]) { sc = 48; break; }
      if (!sc && syn.length) for (j = 0; j < syn.length; j++) if (nk(hay).indexOf(nk(syn[j])) > -1) { sc = 56; break; }
      if (sc > 0) hits.push({ kind: "tsb", id: t.id, score: sc + (wantR && rc ? 34 : (wantT && !rc ? 30 : 0)) + (rc ? 12 : 0) + SV[t.sev].w * 0.5, title: t.t, sub: t.ref + " · " + t.date + " · " + t.cat, color: rc ? "#FFD60A" : "#4D8DFF", badge: rc ? "RAPPEL" : "TSB" });
    });
    DB.models.forEach(function (m) { var b = BIDX[m.b], sc = score(qn, (b ? b.n + " " + b.pays + " " + REGIONS[b.region] + " " : "") + m.n + " phase " + m.phase); if (sc > 0) hits.push({ kind: "model", id: m.id, score: sc + 4, title: (b ? b.n + " " : "") + m.n, sub: "phase " + m.phase + " · " + m.seg + " · " + m.y[0] + "-" + m.y[1] + " · " + (b ? REGIONS[b.region] : ""), color: "#4D8DFF", badge: "MODÈLE" }); });
    DB.brands.forEach(function (b) { var sc = score(qn, b.n + " " + b.pays + " " + b.grp + " " + REGIONS[b.region]); if (sc > 0) hits.push({ kind: "brand", id: b.id, score: sc, title: b.n, sub: b.pays + " · " + b.grp + " · " + REGIONS[b.region], color: "#25D4EE", badge: "MARQUE" }); });
    hits.sort(function (a, b) { return b.score - a.score; });
    var seen = {}, out = []; for (i = 0; i < hits.length && out.length < 18; i++) { var k = hits[i].kind + ":" + hits[i].id; if (seen[k]) continue; seen[k] = 1; out.push(hits[i]); }
    return out;
  }
  function hl(text, q) { var n = String(q || "").trim(); if (!n) return esc(text); var idx = String(text).toLowerCase().indexOf(n.toLowerCase()); if (idx < 0) return esc(text); return esc(String(text).slice(0, idx)) + "<mark>" + esc(String(text).slice(idx, idx + n.length)) + "</mark>" + esc(String(text).slice(idx + n.length)); }
  function omniRender() {
    var box = $("#omnires"); if (!box) return; var q = S.omni.q;
    if (!q || q.trim().length < 2) { var seeds = ["3008 courroie", "3008 rappel", "1.5 BlueHDi chaine", "AdBlue SCR", "EGR FAP", "EAT8 à-coups", "Ioniq 5 ICCU", "pompe à vide", "CVT Nissan", "Chine 12V", "P20E8"]; var h = "<div class='grp'>RECHERCHE PRÉDICTIVE — TOUTES MARQUES · MODÈLES · PHASES · PANNES · RAPPELS · TSB</div><div class='hint'>"; seeds.forEach(function (s) { h += "<button data-act='omniSeed' data-q='" + esc(s) + "'>" + esc(s) + "</button>"; }); box.innerHTML = h + "</div>"; box.classList.add("on"); return; }
    var hits = omniSearch(q); S.omni.hits = hits; S.omni.idx = hits.length ? 0 : -1;
    if (!hits.length) { box.innerHTML = "<div class='grp'>AUCUN RÉSULTAT POUR « " + esc(q) + " »</div><div class='hint'><button data-act='omniSeed' data-q='rappel'>rappels</button><button data-act='omniSeed' data-q='courroie'>courroie</button><button data-act='omniSeed' data-q='AdBlue'>AdBlue</button></div>"; box.classList.add("on"); return; }
    var order = ["fault", "tsb", "engine", "model", "brand"], lab = { fault: "PANNES CONNUES", tsb: "CAMPAGNES DE RAPPEL / TSB / BULLETINS", engine: "MOTORISATIONS", model: "MODÈLES", brand: "MARQUES" }, html = "";
    order.forEach(function (kind) { var grp = hits.filter(function (x) { return x.kind === kind; }); if (!grp.length) return; html += "<div class='grp'>" + lab[kind] + " · " + grp.length + "</div>"; grp.forEach(function (it) { var gi = hits.indexOf(it); html += "<button class='hit" + (gi === S.omni.idx ? " sel" : "") + "' data-act='omniHit' data-kind='" + it.kind + "' data-id='" + esc(it.id) + "'><span class='k' style='color:" + it.color + "'>" + it.badge + "</span><span class='tx'><b>" + hl(it.title, q) + "</b><small>" + esc(it.sub) + "</small></span>" + ic("chev", "width:12px;height:12px;color:#61748C") + "</button>"; }); });
    box.innerHTML = html; box.classList.add("on");
  }
  function omniClose() { var b = $("#omnires"); if (b) b.classList.remove("on"); S.omni.idx = -1; }
  function omniActivate(kind, id) { omniClose(); var inp = $("#omni"); if (inp) inp.blur(); if (kind === "engine" || kind === "fault" || kind === "tsb") openDrawer(kind, id, !!S.drawer); else if (kind === "model") { var m = MIDX[id]; if (m) { S.sel.b = m.b; S.sel.m = m.id; S.sel.e = ""; location.hash = "#/explorer"; render(); } beep("tick"); } else { S.sel.b = id; S.sel.m = ""; S.sel.e = ""; location.hash = "#/explorer"; render(); beep("tick"); } }
  function omniMove(d) { var box = $("#omnires"); if (!box || !box.classList.contains("on")) return; var els = $$(".hit", box); if (!els.length) return; S.omni.idx = clamp(S.omni.idx + d, 0, els.length - 1); els.forEach(function (el, i) { el.classList.toggle("sel", i === S.omni.idx); }); els[S.omni.idx].scrollIntoView({ block: "nearest" }); }

  function selEngine() { return S.sel.e ? EIDX[S.sel.e] : null; }
  function modelsOfBrand(b) { return DB.models.filter(function (m) { return m.b === b; }).sort(function (a, b2) { return a.n.localeCompare(b2.n); }); }
  function enginesOfModel(mid) { return DB.engines.filter(function (e) { return e.m.indexOf(mid) > -1; }).sort(function (a, b) { return a.hp - b.hp; }); }
  function results() {
    var f = S.f, q = f.q.trim().toLowerCase();
    var list = DB.engines.filter(function (e) {
      var m = modelOf(e), b = brandOf(e);
      if (S.sel.b && (!m || m.b !== S.sel.b)) return false;
      if (S.sel.m && e.m.indexOf(S.sel.m) < 0) return false;
      if (S.sel.e && e.id !== S.sel.e) return false;
      if (f.region && b && b.region !== f.region) return false;
      if (f.fuel.length && f.fuel.indexOf(e.fuel) < 0) return false;
      if (!ov(e.y, f.y)) return false;
      if (q) { var hay = [(b ? b.n : ""), (m ? m.n : ""), e.code, e.fam, e.label, (b ? b.pays : "")].join(" ").toLowerCase(); if (hay.indexOf(q) < 0) return false; }
      return true;
    });
    var so = { brand: function (a, b) { var x = brandOf(a), y = brandOf(b); return ((x ? x.n : "")).localeCompare(y ? y.n : "") || b.hp - a.hp; }, hpdesc: function (a, b) { return b.hp - a.hp; }, year: function (a, b) { return b.y[0] - a.y[0]; }, ivi: function (a, b) { return ivi(b) - ivi(a); } };
    return list.sort(so[f.sort] || so.brand);
  }
  function engCard(e, i) {
    var F = FU[e.fuel], b = brandOf(e), m = modelOf(e), v = ivi(e), nf = faultsFor(e).filter(function (f) { return f.sev !== "info"; }).length, ts = tsbFor(e), nr = ts.filter(isRecall).length;
    var h = "<article class='card hov eng' style='--fc:" + F.c + "' data-act='openEng' data-id='" + e.id + "' tabindex='0'>";
    h += "<div class='top'><span class='br'>" + esc(b ? b.n : "—") + "</span>" + fuelTag(e.fuel) + "<span class='tag' style='margin-left:auto'>phase " + (m ? m.phase : 1) + "</span></div>";
    h += "<h4>" + esc(m ? m.n : "") + "</h4><div class='lbl'>" + esc(e.label) + "</div>";
    h += "<div class='pw'><b>" + e.hp + "</b><span>ch · " + e.kw + " kW</span><span style='margin-left:auto'>" + e.nm + " Nm</span></div>";
    h += "<div class='meta'><span class='tag mono'>" + esc(e.code) + "</span><span class='tag'>" + e.y[0] + "-" + e.y[1] + "</span><span class='tag'>" + esc(e.gb) + "</span>";
    if (nr) h += "<span class='tag' style='color:#FFD60A'>" + ic("bell", "width:9px;height:9px") + nr + "</span>";
    h += "</div><div class='ft'><span>" + ic("alert", "width:12px;height:12px;color:" + (nf ? "#FFAF2E" : "#61748C")) + " " + nf + "</span><span>" + ic("file", "width:12px;height:12px;color:" + (ts.length ? "#4D8DFF" : "#61748C")) + " " + ts.length + "</span>" + iviPill(v) + "</div></article>";
    return h;
  }
  function vBord() {
    var c = META.counts, h = "", i;
    h += "<div class='hero'><span class='kick'>MODULE 01 — POSTE DE BORD</span><h2>MÉGA-BASE <i>2017 → 2027</i><br>" + fmt(c.b) + " marques · " + fmt(c.m) + " modèles · " + fmt(c.e) + " motorisations</h2>";
    h += "<p>Françaises, européennes, asiatiques, chinoises et américaines. " + fmt(c.f) + " pannes détaillées, " + fmt(c.t) + " bulletins dont <b style='color:#FFD60A'>" + fmt(c.rc) + " campagnes de rappel</b>, " + c.dom + " domaines techniques. Plans d'entretien complets jusqu'à 200 000 km pour chaque marque, modèle, phase, motorisation et puissance sélectionnés.</p>";
    h += "<div class='hint' style='padding:9px 0 0'>";["3008 courroie", "3008 rappel", "1.5 BlueHDi chaine", "AdBlue SCR", "EGR FAP", "EAT8 à-coups", "Ioniq 5 ICCU", "CVT Nissan", "Chine 12V", "P20E8"].forEach(function (s) { h += "<button data-act='omniSeed' data-q='" + esc(s) + "'>" + ic("search", "width:9px;height:9px") + esc(s) + "</button>"; }); h += "</div>";
    h += "<div class='acts'><a class='btn pri' href='#/explorer'>" + ic("car") + "Sélection précise du parc</a><button class='btn grn' data-act='goDiag'>" + ic("stetho") + "Autovérification</button>";
    if (isAdmin()) h += "<button class='btn amb' data-act='goAdmin'>" + ic("db") + "Administration</button>";
    h += "<a class='btn' href='#/studio'>" + ic("spark") + "Studio fond</a></div></div>";
    var kp = [["db", "MARQUES", c.b, "#25D4EE"], ["car", "MODÈLES", c.m, "#4D8DFF"], ["piston", "MOTORISATIONS", c.e, "#E45CFF"], ["alert", "PANNES", c.f, "#FF4D5E"], ["bell", "RAPPELS", c.rc, "#FFD60A"], ["wrench", "DOMAINES", c.dom, "#43E08B"]];
    h += "<div class='kpis'>"; kp.forEach(function (k) { h += "<div class='card kpi' style='--kc:" + k[3] + "'>" + ic(k[0]) + "<b>" + fmt(k[2]) + "</b><span>" + k[1] + "</span></div>"; }); h += "</div>";
    var regs = Object.keys(REGIONS).map(function (r) { return { r: r, n: META.regions[r] || 0 }; });
    var rm = Math.max.apply(null, regs.map(function (x) { return x.n; }).concat([1]));
    h += "<div class='g2'><div class='card panel'><h3>" + ic("db") + "Marques par région<span class='chip'>" + fmt(c.b) + "</span></h3><div class='bars'>";
    regs.forEach(function (x) { h += "<div class='brow'><span class='bl'>" + REGIONS[x.r] + "</span><div class='bt'><i data-w='" + Math.round(x.n / rm * 100) + "%' style='--bc:" + (x.r === "france" ? "#4D8DFF" : x.r === "europe" ? "#25D4EE" : x.r === "asie" ? "#FF4D5E" : x.r === "chine" ? "#FFD60A" : "#43E08B") + "'></i></div><b>" + x.n + "</b></div>"; });
    h += "</div></div>";
    var fc = Object.keys(FU).map(function (f) { return { f: f, n: DB.engines.filter(function (e) { return e.fuel === f; }).length }; }).filter(function (x) { return x.n; });
    var mx = Math.max.apply(null, fc.map(function (x) { return x.n; }).concat([1]));
    h += "<div class='card panel'><h3>" + ic("piston") + "Énergies du parc<span class='chip'>" + fmt(c.e) + "</span></h3><div class='bars'>";
    fc.forEach(function (x) { h += "<div class='brow'><span class='bl'>" + FU[x.f].l + "</span><div class='bt'><i data-w='" + Math.round(x.n / mx * 100) + "%' style='--bc:" + FU[x.f].c + "'></i></div><b>" + fmt(x.n) + "</b></div>"; });
    h += "</div></div></div>";
    var sc = Object.keys(SV).map(function (s) { return { s: s, n: DB.faults.filter(function (f) { return f.sev === s; }).length }; });
    var sm = Math.max.apply(null, sc.map(function (x) { return x.n; }).concat([1]));
    var al = DB.faults.filter(function (f) { return f.sev === "critique"; }).slice(0, 5);
    var rc = DB.tsb.filter(isRecall).sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 5);
    h += "<div class='g2'><div class='card panel'><h3>" + ic("alert") + "Sévérité des pannes</h3><div class='bars'>";
    sc.forEach(function (x) { h += "<div class='brow'><span class='bl'>" + x.s.toUpperCase() + "</span><div class='bt'><i data-w='" + Math.round(x.n / sm * 100) + "%' style='--bc:" + SV[x.s].c + "'></i></div><b>" + x.n + "</b></div>"; });
    h += "</div></div><div class='card panel'><h3>" + ic("info") + "Couverture technique</h3><div class='sg'>";
    [["Familles moteur", c.fam], ["Domaines", c.dom], ["Liaisons", META.links], ["Corrélations", META.corr], ["Intégrité", META.integ.pct + " %"], ["Poids base", META.size + " Ko"]].forEach(function (r) { h += "<div class='sp'><span>" + esc(r[0]) + "</span><b class='hl'>" + fmt(r[1]) + "</b></div>"; });
    h += "</div></div></div>";
    h += "<div class='g2'><div class='card panel'><h3>" + ic("alert", "color:#FF4D5E") + "Alertes prioritaires</h3><div class='feed'>";
    al.forEach(function (f) { h += "<button class='fi' data-act='openFault' data-id='" + f.id + "'><span class='fx'>" + ic("alert", "width:14px;height:14px") + "</span><span style='flex:1;min-width:0'><b>" + esc(f.t) + "</b><small>" + esc(f.dom) + " · " + esc(f.fam.slice(0, 3).join(" · ")) + "</small></span>" + ic("chev", "width:13px;height:13px;color:#61748C") + "</button>"; });
    h += "</div></div><div class='card panel'><h3>" + ic("bell", "color:#FFD60A") + "Campagnes de rappel</h3><div class='feed'>";
    rc.forEach(function (t) { h += "<button class='fi r' data-act='openTsb' data-id='" + t.id + "'><span class='fx'>" + ic("bell", "width:14px;height:14px") + "</span><span style='flex:1;min-width:0'><b>" + esc(t.t) + "</b><small>" + esc(t.ref) + " · " + esc(t.date) + "</small></span>" + ic("chev", "width:13px;height:13px;color:#61748C") + "</button>"; });
    h += "</div></div></div>";
    return h;
  }
  function vExplorer() {
    var h = "", i;
    h += "<div class='vh'><div><span class='kick'>MODULE 02 — PARC 2017 → 2027</span><h1>SÉLECTION <i>PRÉCISE</i></h1><div class='sub'>Marque → Modèle (phase) → Motorisation (puissance). La sélection alimente directement le plan d'entretien du module 4 jusqu'à 200 000 km.</div></div></div>";
    h += "<div class='exwrap'><div class='card filters'>";
    h += "<div class='fsec'><label class='lb'>Région</label><select class='sel' data-f='region'><option value=''>Toutes les régions</option>";
    Object.keys(REGIONS).forEach(function (r) { h += "<option value='" + r + "' " + (S.f.region === r ? "selected" : "") + ">" + REGIONS[r] + " (" + (META.regions[r] || 0) + " marques)</option>"; }); h += "</select></div>";
    var brands = DB.brands.filter(function (b) { return !S.f.region || b.region === S.f.region; });
    h += "<div class='fsec'><label class='lb'>1 · Marque</label><select class='sel' data-sel='b'><option value=''>Toutes les marques (" + brands.length + ")</option>";
    brands.forEach(function (b) { h += "<option value='" + b.id + "' " + (S.sel.b === b.id ? "selected" : "") + ">" + esc(b.n) + " (" + (META.byBrand[b.id] || 0) + ")</option>"; }); h += "</select></div>";
    var mods = S.sel.b ? modelsOfBrand(S.sel.b) : [];
    h += "<div class='fsec'><label class='lb'>2 · Modèle & phase</label><select class='sel' data-sel='m' " + (S.sel.b ? "" : "disabled") + "><option value=''>" + (S.sel.b ? mods.length + " modèle(s)" : "Choisir une marque") + "</option>";
    mods.forEach(function (m) { h += "<option value='" + m.id + "' " + (S.sel.m === m.id ? "selected" : "") + ">" + esc(m.n) + " · phase " + m.phase + " · " + m.y[0] + "-" + m.y[1] + "</option>"; }); h += "</select></div>";
    var engs = S.sel.m ? enginesOfModel(S.sel.m) : [];
    h += "<div class='fsec'><label class='lb'>3 · Motorisation & puissance</label><select class='sel' data-sel='e' " + (S.sel.m ? "" : "disabled") + "><option value=''>" + (S.sel.m ? engs.length + " motorisation(s)" : "Choisir un modèle") + "</option>";
    engs.forEach(function (e) { h += "<option value='" + e.id + "' " + (S.sel.e === e.id ? "selected" : "") + ">" + esc(e.label) + " · " + e.hp + " ch · " + esc(e.code) + " · " + esc(e.gb) + "</option>"; }); h += "</select></div>";
    h += "<div class='fsec'><label class='lb'>Recherche libre</label><input class='inp' type='search' data-f='q' value='" + esc(S.f.q) + "' placeholder='Code, famille, libellé, pays…'></div>";
    h += "<div class='fsec'><label class='lb'>Énergie</label><div class='chipset'>";
    Object.keys(FU).forEach(function (k) { h += "<button class='fc " + (S.f.fuel.indexOf(k) > -1 ? "on" : "") + "' style='--fc:" + FU[k].c + "' data-act='ffuel' data-k='" + k + "'>" + FU[k].l + "</button>"; }); h += "</div></div>";
    h += "<div class='fsec'><button class='btn sm ghost' data-act='resetSel' style='width:100%'>" + ic("reset") + "Réinitialiser la sélection</button></div></div>";
    h += "<div>";
    var e = selEngine();
    if (e) {
      var m = modelOf(e), b = brandOf(e), fs = faultsFor(e), ts = tsbFor(e), nr = ts.filter(isRecall).length, v = ivi(e), L = IVL(v);
      h += "<div class='selcard'><h3>" + ic("check", "width:16px;height:16px") + " SÉLECTION ACTIVE — " + esc((b ? b.n : "") + " " + (m ? m.n : "")) + " · " + esc(e.label) + "</h3>";
      h += "<div class='sg'><div class='sp'><span>Région</span><b class='hl'>" + (b ? REGIONS[b.region] : "—") + "</b></div><div class='sp'><span>Phase modèle</span><b class='hl'>" + (m ? m.phase : "—") + "</b></div><div class='sp'><span>Code moteur</span><b class='hl'>" + esc(e.code) + "</b></div><div class='sp'><span>Puissance</span><b class='hl'>" + e.hp + " ch / " + e.kw + " kW</b></div><div class='sp'><span>Couple</span><b class='hl'>" + e.nm + " Nm</b></div><div class='sp'><span>Boîte</span><b class='hl'>" + esc(e.gb) + "</b></div><div class='sp'><span>Production</span><b class='hl'>" + e.y[0] + "-" + e.y[1] + "</b></div><div class='sp'><span>Pannes corrélées</span><b class='hl'>" + fs.length + "</b></div><div class='sp'><span>Rappels</span><b class='hl'>" + nr + "</b></div><div class='sp'><span>IVI</span><b class='hl' style='color:" + L[1] + "'>" + v + " · " + L[0] + "</b></div></div>";
      h += "<div style='display:flex;gap:7px;flex-wrap:wrap;margin-top:11px'><button class='btn pri sm' data-act='goPlan'>" + ic("wrench") + "Plan d'entretien 200 000 km</button><button class='btn sm ghost' data-act='openEng' data-id='" + e.id + "'>" + ic("piston") + "Fiche technique</button></div></div>";
    }
    var l = results(), s = l.slice(0, S.shown);
    h += "<div class='bar'><span class='cnt'>" + fmt(l.length) + " motorisation(s)</span><select class='sel' data-f='sort' style='margin-left:auto;width:auto'>";
    [["brand", "Marque A-Z"], ["hpdesc", "Puissance ↓"], ["year", "Année ↓"], ["ivi", "Vigilance ↓"]].forEach(function (o) { h += "<option value='" + o[0] + "' " + (S.f.sort === o[0] ? "selected" : "") + ">" + o[1] + "</option>"; });
    h += "</select></div><div class='eg'>" + (s.length ? s.map(engCard).join("") : "<div class='empty' style='grid-column:1/-1'>" + ic("search") + "<p>Aucune motorisation ne correspond.</p></div>") + "</div>";
    h += "<div class='more'>" + (l.length > S.shown ? "<button class='btn ghost' data-act='more'>Afficher plus (" + fmt(l.length - S.shown) + ")</button>" : "") + "</div></div></div>";
    return h;
  }
  function vTech() {
    var L = S.tech, h = "", i, nr = DB.tsb.filter(isRecall).length;
    h += "<div class='vh'><div><span class='kick'>MODULE 03 — RECHERCHE TECHNIQUE EXTRÊME</span><h1>PANNES · TSB · <i>RAPPELS</i></h1><div class='sub'>Corrélation réelle marque / modèle / phase / motorisation, toutes régions 2017-2027. Filtres cumulables région, domaine, sévérité, kilométrage, code défaut et texte intégral.</div></div></div>";
    h += "<div class='atabs'><button class='at " + (L.tab === "faults" ? "on" : "") + "' data-act='techTab' data-t='faults'>" + ic("alert", "width:13px;height:13px") + "PANNES<span class='n'>" + DB.faults.length + "</span></button>";
    h += "<button class='at " + (L.tab === "tsb" ? "on" : "") + "' data-act='techTab' data-t='tsb'>" + ic("file", "width:13px;height:13px") + "TSB / BULLETINS<span class='n'>" + (DB.tsb.length - nr) + "</span></button>";
    h += "<button class='at " + (L.tab === "recalls" ? "on" : "") + "' data-act='techTab' data-t='recalls'>" + ic("bell", "width:13px;height:13px") + "RAPPELS<span class='n'>" + nr + "</span></button></div>";
    h += "<div class='card panel' style='margin-bottom:12px'><div class='fr f4'>";
    h += "<div><label class='lb'>Texte intégral / code défaut</label><input class='inp' type='search' data-tf='q' value='" + esc(L.q) + "' placeholder='Symptôme, P20E8, cause, action…'></div>";
    h += "<div><label class='lb'>Région</label><select class='sel' data-tf='region'><option value=''>Toutes</option>";
    Object.keys(REGIONS).forEach(function (r) { h += "<option value='" + r + "' " + (L.region === r ? "selected" : "") + ">" + REGIONS[r] + "</option>"; }); h += "</select></div>";
    var tbrands = DB.brands.filter(function (b) { return !L.region || b.region === L.region; });
    h += "<div><label class='lb'>Marque</label><select class='sel' data-tf='brand'><option value=''>Toutes</option>";
    tbrands.forEach(function (b) { h += "<option value='" + b.id + "' " + (L.brand === b.id ? "selected" : "") + ">" + esc(b.n) + "</option>"; }); h += "</select></div>";
    h += "<div><label class='lb'>Modèle</label><select class='sel' data-tf='model' " + (L.brand ? "" : "disabled") + "><option value=''>Tous</option>";
    if (L.brand) modelsOfBrand(L.brand).forEach(function (m) { h += "<option value='" + m.id + "' " + (L.model === m.id ? "selected" : "") + ">" + esc(m.n) + " · phase " + m.phase + "</option>"; }); h += "</select></div></div>";
    h += "<div class='fr f4' style='margin-top:10px'><div><label class='lb'>Phase</label><select class='sel' data-tf='phase'><option value=''>Toutes</option>";
    for (i = 1; i <= 12; i++) h += "<option value='" + i + "' " + (L.phase === String(i) ? "selected" : "") + ">Phase " + i + "</option>"; h += "</select></div>";
    h += "<div><label class='lb'>Sévérité</label><select class='sel' data-tf='sev'><option value=''>Toutes</option>";
    Object.keys(SV).forEach(function (s) { h += "<option value='" + s + "' " + (L.sev === s ? "selected" : "") + ">" + s + "</option>"; }); h += "</select></div>";
    var doms = {}; DB.faults.forEach(function (f) { doms[f.dom] = 1; }); DB.tsb.forEach(function (t) { doms[t.dom] = 1; });
    h += "<div><label class='lb'>Domaine technique</label><select class='sel' data-tf='dom'><option value=''>Tous (" + Object.keys(doms).length + ")</option>";
    Object.keys(doms).sort().forEach(function (d) { h += "<option value='" + esc(d)"' " + (L.dom === d ? "selected" : "") + ">" + esc(d) + "</option>"; }); h += "</select></div>";
    h += "<div><label class='lb'>Kilométrage véhicule</label><input class='inp mono' type='number' min='0' max='400000' step='5000' data-tf='km' value='" + esc(L.km) + "' placeholder='ex. 90000'></div></div></div>";
    var q = L.q.trim().toLowerCase(), kmv = +L.km || 0, out = [], targetModel = L.model ? MIDX[L.model] : null;
    function ctxOk(item) {
      if (L.region) { var rok = false; if (item.b && item.b.length) { for (var i4 = 0; i4 < item.b.length; i4++) if (BIDX[item.b[i4]] && BIDX[item.b[i4]].region === L.region) { rok = true; break; } } if (!rok && item.fam && item.fam.length) { var eg = DB.engines.filter(function (e) { var b = brandOf(e); return b && b.region === L.region && item.fam.indexOf(e.fam) > -1; }); if (eg.length) rok = true; } if (!rok && item.mt && item.mt.length) { var mm = DB.models.filter(function (m) { var b = BIDX[m.b]; return b && b.region === L.region && tokHit(item.mt, m.n); }); if (mm.length) rok = true; } if (!rok) return false; }
      if (L.brand) { var hit = false; if (item.mt && item.mt.length) { var mods = DB.models.filter(function (m) { return m.b === L.brand; }); for (var i2 = 0; i2 < mods.length; i2++) if (tokHit(item.mt, mods[i2].n)) { hit = true; break; } } if (!hit && item.b && item.b.indexOf(L.brand) > -1) hit = true; if (!hit && item.fam && item.fam.length) { var engs = DB.engines.filter(function (e) { var m = modelOf(e); return m && m.b === L.brand && item.fam.indexOf(e.fam) > -1; }); if (engs.length) hit = true; } if (!hit) return false; }
      if (targetModel && !tokHit(item.mt, targetModel.n)) { var famHit = false, me = enginesOfModel(targetModel.id); for (var i3 = 0; i3 < me.length; i3++) if (item.fam && item.fam.indexOf(me[i3].fam) > -1) { famHit = true; break; } if (!famHit) return false; }
      if (L.phase && item.ph && item.ph.length && item.ph.indexOf("*") < 0 && item.ph.indexOf(L.phase) < 0) return false;
      if (L.sev && item.sev !== L.sev) return false;
      if (L.dom && item.dom !== L.dom) return false;
      if (kmv && item.km && (kmv < item.km[0] || kmv > item.km[1])) return false;
      if (q) { var hay = [item.t, item.ref || "", item.cause || "", item.fix || "", item.sum || "", item.act || "", (item.sym || []).join(" "), (item.fam || []).join(" "), (item.mt || []).join(" "), item.dom].join(" ").toLowerCase(); if (hay.indexOf(q) < 0) return false; }
      return true;
    }
    if (L.tab === "faults") { out = DB.faults.filter(ctxOk).sort(function (a, b) { return SV[b.sev].w - SV[a.sev].w; }); h += "<div class='bar'><span class='cnt'>" + out.length + " fiche(s) corrélée(s)</span></div><div class='eg' style='grid-template-columns:repeat(auto-fill,minmax(340px,1fr))'>"; out.slice(0, 120).forEach(function (f) { h += "<div>" + faultCard(f, false, false) + "<div class='dim mono' style='font-size:9.5px;margin:-4px 0 9px 4px'>" + enginesForFault(f).length + " motorisation(s) corrélée(s)</div></div>"; }); }
    else { out = DB.tsb.filter(function (t) { var rc = isRecall(t); if (L.tab === "recalls" && !rc) return false; if (L.tab === "tsb" && rc) return false; return ctxOk(t); }).sort(function (a, b) { return b.date.localeCompare(a.date); }); h += "<div class='bar'><span class='cnt'>" + out.length + " bulletin(s) corrélé(s)</span></div><div class='eg' style='grid-template-columns:repeat(auto-fill,minmax(340px,1fr))'>"; out.slice(0, 120).forEach(function (t) { h += "<div>" + tsbCard(t, false) + "</div>"; }); }
    if (!out.length) h += "<div class='empty' style='grid-column:1/-1'>" + ic("search") + "<p>Aucun résultat pour ces critères.</p></div>";
    h += "</div>"; return h;
  }
  function vEntretien() {
    var e = selEngine(), h = "";
    h += "<div class='vh'><div><span class='kick'>MODULE 04 — ENTRETIEN JUSQU'À 200 000 KM</span><h1>PLAN <i>PAR MOTORISATION</i></h1><div class='sub'>Le plan reprend exactement la sélection du module 2 : marque, modèle, phase, code moteur, puissance et boîte. Toutes les interventions et tous les contrôles, de la première révision à 200 000 km.</div></div>";
    h += "<a class='btn sm ghost' href='#/explorer'>" + ic("car") + "Modifier la sélection</a></div>";
    if (!e) { h += "<div class='empty'>" + ic("wrench") + "<p><b>Aucune motorisation sélectionnée.</b></p><p class='dim' style='font-size:12px;margin-top:6px'>Choisissez marque → modèle → motorisation dans le module 2 pour obtenir le plan complet.</p><a class='btn pri sm' href='#/explorer' style='margin-top:12px'>" + ic("car") + "Ouvrir le parc</a></div>"; return h; }
    var m = modelOf(e), b = brandOf(e), pl = buildPlan(e, m, b);
    h += planHTML(pl, false);
    var fs = faultsFor(e).filter(function (f) { return f.sev !== "info"; }), rc = tsbFor(e).filter(isRecall);
    h += "<div class='g2' style='margin-top:13px'><div class='card panel'><h3>" + ic("alert", "color:#FFAF2E") + "Pannes à surveiller<span class='chip'>" + fs.length + "</span></h3>" + (fs.length ? fs.slice(0, 6).map(function (f) { return faultCard(f, !f.active, false); }).join("") : "<p class='dim'>Aucune panne référencée.</p>") + "</div>";
    h += "<div class='card panel'><h3>" + ic("bell", "color:#FFD60A") + "Campagnes de rappel<span class='chip'>" + rc.length + "</span></h3>" + (rc.length ? rc.map(function (t) { return tsbCard(t, false); }).join("") : "<p class='dim'>Aucune campagne de rappel sur ce périmètre.</p>") + "</div></div>";
    h += "<div class='calc'><h3>" + ic("cal") + "CALCULATEUR D'ÉCHÉANCE</h3><div class='fr f3'>";
    h += "<div><label class='lb'>Kilométrage actuel</label><input class='inp mono' type='number' min='0' max='400000' step='1000' data-calc='km' value='" + S.calc.km + "'></div>";
    h += "<div><label class='lb'>Mise en circulation</label><input class='inp mono' type='number' min='2005' max='" + YMAX + "' data-calc='year' value='" + S.calc.year + "'></div>";
    h += "<div><label class='lb'>Profil d'usage</label><select class='sel' data-calc='sev'><option value='1' " + (S.calc.sev === 1 ? "selected" : "") + ">Normal</option><option value='0.75' " + (S.calc.sev === 0.75 ? "selected" : "") + ">Sévère (urbain / charge)</option></select></div></div>";
    h += "<div class='due' id='dueList'>" + dueHTML(pl) + "</div></div>";
    return h;
  }
  function vStudio() {
    var P = WP.P, h = "", i;
    h += "<div class='vh'><div><span class='kick'>MODULE 05 — STUDIO FOND D'ÉCRAN</span><h1>FONDS <i>DYNAMIQUES</i></h1><div class='sub'>8 scènes animées, palette entièrement pilotable, vitesse et sens de défilement. Réglages appliqués en direct." + (isTier() ? " En session tiers, les réglages ne sont pas enregistrés et l'export PNG est réservé à l'administrateur." : "") + "</div></div>";
    h += "<div style='display:flex;gap:7px;flex-wrap:wrap'><button class='btn sm ghost' data-act='stRandom'>" + ic("dice") + "Aléatoire</button><button class='btn sm ghost' data-act='stReset'>" + ic("reset") + "Réinitialiser</button>";
    h += isAdmin() ? "<button class='btn sm pri' data-act='stPng'>" + ic("cam") + "Export PNG</button>" : "<button class='btn sm' disabled title='Réservé administrateur'>" + ic("lock") + "Export PNG</button>";
    h += "</div></div>";
    h += "<div class='stwrap'><div class='card stage'><div class='screen' id='screen'><canvas id='pv'></canvas><div class='hud' id='hud'></div></div>";
    h += "<div style='display:flex;gap:7px;flex-wrap:wrap;margin-top:11px'><button class='btn sm " + (P.run ? "amb" : "ghost") + "' data-act='stRun'>" + ic(P.run ? "pause" : "play") + (P.run ? "Pause" : "Lecture") + "</button><button class='btn sm ghost' data-act='stDir'>" + ic("reset") + (P.dir > 0 ? "Sens : avant" : "Sens : arrière") + "</button></div>";
    h += "<div class='psrow' style='margin-top:10px'>"; Object.keys(WP.PRESETS).forEach(function (n) { h += "<button data-act='stPreset' data-n='" + esc(n) + "'>" + esc(n) + "</button>"; }); h += "</div></div>";
    h += "<div class='card ctrl'><div class='csec'><label class='lb'>Scène animée</label><div class='mgrid'>";
    WP.MODES.forEach(function (m) { h += "<button class='mb " + (P.mode === m[0] ? "on" : "") + "' data-act='stMode' data-m='" + m[0] + "'><i style='background:linear-gradient(135deg," + WP.pal().a + "," + WP.pal().b + ")'></i>" + m[1] + "</button>"; }); h += "</div></div>";
    h += "<div class='csec'><label class='lb'>Palette prédéfinie</label><div class='pgrid'>";
    Object.keys(WP.TH).forEach(function (k) { var v = WP.TH[k]; h += "<button class='pb " + (!P.useCustom && P.theme === k ? "on" : "") + "' data-act='stTheme' data-t='" + k + "' title='" + esc(v.n) + "' style='background:linear-gradient(135deg," + v.a + "," + v.b + "," + v.c + ")'></button>"; }); h += "</div>";
    h += "<div class='srow' style='margin-top:8px'><span>Palette personnalisée</span><label class='sw'><input type='checkbox' id='customToggle' data-act='stCustom' " + (P.useCustom ? "checked" : "") + "><i></i></label></div>";
    h += "<div class='crow' style='margin-top:8px'>";[["bg", "Fond"], ["a", "Dominante"], ["b", "Accent 1"], ["c", "Accent 2"], ["d", "Accent 3"]].forEach(function (c) { h += "<div><label>" + c[1] + "</label><input type='color' data-c='" + c[0] + "' value='" + P.custom[c[0]] + "'></div>"; }); h += "</div></div>";
    var sl = [["speed", "Vitesse de défilement", 0, 200, 5], ["density", "Densité", 0, 100, 1], ["count", "Particules", 10, 400, 5], ["turb", "Turbulence", 0, 100, 1], ["scale", "Échelle / grille", 20, 160, 2], ["glow", "Halo lumineux", 0, 100, 1], ["blur", "Flou", 0, 8, 0.5], ["stroke", "Épaisseur trait", 0.5, 4, 0.1], ["drift", "Dérive caméra", 0, 100, 1]];
    h += "<div class='csec'>"; sl.forEach(function (s) { h += "<div><div class='srow'><span>" + s[1] + "</span><span class='sval' data-pv='" + s[0] + "'>" + WP.label(s[0], P[s[0]]) + "</span></div><input type='range' data-p='" + s[0] + "' min='" + s[2] + "' max='" + s[3] + "' step='" + s[4] + "' value='" + P[s[0]] + "'></div>"; }); h += "</div>";
    h += "<div class='csec'><div class='fr f2'><div><label class='lb'>Sens</label><select class='sel' data-p='dir'><option value='1' " + (P.dir > 0 ? "selected" : "") + ">Avant</option><option value='-1' " + (P.dir < 0 ? "selected" : "") + ">Arrière</option></select></div>";
    h += "<div><label class='lb'>Qualité</label><select class='sel' data-p='quality'><option value='eco' " + (P.quality === "eco" ? "selected" : "") + ">Éco 1×</option><option value='std' " + (P.quality === "std" ? "selected" : "") + ">Standard 1.5×</option><option value='ultra' " + (P.quality === "ultra" ? "selected" : "") + ">Ultra 2×</option></select></div></div>";
    h += "<div style='margin-top:9px'><label class='lb'>Format export PNG</label><select class='sel' data-p='format' " + (isAdmin() ? "" : "disabled") + "><option value='free' " + (P.format === "free" ? "selected" : "") + ">1600×900</option><option value='mobile' " + (P.format === "mobile" ? "selected" : "") + ">1170×2532</option><option value='tablet' " + (P.format === "tablet" ? "selected" : "") + ">1668×2224</option><option value='desktop' " + (P.format === "desktop" ? "selected" : "") + ">1920×1080</option></select></div></div>";
    h += "<div class='csec'>";[["grid", "Grille & repères"], ["grain", "Grain"], ["scan", "Balayage"], ["vig", "Vignettage"], ["run", "Animation"], ["bg", "Fond global"]].forEach(function (t) { h += "<div class='srow'><span>" + t[1] + "</span><label class='sw'><input type='checkbox' data-p='" + t[0] + "' " + (P[t[0]] ? "checked" : "") + "><i></i></label></div>"; }); h += "</div></div></div>";
    return h;
  }
  function vAdmin() {
    if (!isAdmin()) return "<div class='empty'>" + ic("lock") + "<p>Module réservé à la session administrateur.</p></div>";
    var A = S.adm, h = "";
    h += "<div class='vh'><div><span class='kick'>MODULE 06 — ADMINISTRATION ING-3</span><h1>BASE · ACCÈS · <i>DIFFUSION</i></h1><div class='sub'>Imports, exports et mises à jour massives réservés à l'administrateur. Gestion des accès tiers en temps réel et diffusion contrôlée de la base.</div></div>";
    h += "<div style='display:flex;gap:7px'><span class='chip warn'>" + ic("shield", "width:11px;height:11px") + "ING-3</span><button class='btn sm ghost' data-act='logout'>" + ic("lock") + "Quitter</button></div></div>";
    h += "<div class='banner'>" + ic("bcast", "width:15px;height:15px;color:#FFD60A") + "<b>Diffusion temps réel</b><label class='sw'><input type='checkbox' data-act='liveToggle' " + (REG.live ? "checked" : "") + "><i></i></label>";
    h += "<span class='dim mono'>rév. " + (REG.rev || 0) + "</span><button class='btn sm pri' data-act='publish'>" + ic("bcast") + "Diffuser maintenant</button>";
    h += "<span class='dim' style='font-size:11px'>" + (REG.live ? "Toute correction ou tout import est diffusé automatiquement aux tiers." : "Diffusion manuelle : les tiers ne voient que la dernière révision publiée.") + "</span></div>";
    h += "<div class='atabs'>";[["files", "FICHIERS", "db", DB.engines.length], ["mega", "MÉGA-BASE", "spark", window.MD_RAW.cand.length], ["import", "IMPORT", "ul", ""], ["access", "ACCÈS TIERS", "users", pendingCount()], ["journal", "JOURNAL", "clock", AUDIT.length]].forEach(function (t) { h += "<button class='at " + (A.tab === t[0] ? "on" : "") + "' data-act='admTab' data-t='" + t[0] + "'>" + ic(t[2], "width:13px;height:13px") + t[1] + (t[3] !== "" ? "<span class='n'>" + t[3] + "</span>" : "") + "</button>"; }); h += "</div>";
    if (A.tab === "files") {
      h += "<div class='fgrid'>";
      FILES.forEach(function (f) { var a = DB[f[0]], k = Math.round(JSON.stringify(a).length / 1024); h += "<div class='card hov filecard'><div class='fn'>" + ic("file") + f[1] + "</div><div class='ct'>" + fmt(a.length) + " <small>entrées</small></div><div class='dim mono' style='font-size:9px'>" + k + " Ko · " + f[2] + "</div><div class='fa'><button class='btn xs ghost' data-act='fileExp' data-k='" + f[0] + "'>" + ic("dl", "width:11px;height:11px") + "JSON</button><button class='btn xs amb' data-act='admTab' data-t='import'>" + ic("ul", "width:11px;height:11px") + "Importer</button></div></div>"; });
      h += "</div><div class='tools'><button class='btn pri sm' data-act='expAll'>" + ic("dl") + "Exporter la base complète</button><button class='btn ghost sm' data-act='saveNow'>" + ic("save") + "Sauvegarder</button><button class='btn ghost sm' data-act='integrity'>" + ic("check") + "Intégrité</button><button class='btn dgr sm' data-act='askReset'>" + ic("reset") + "Base usine</button></div>";
      h += "<div class='card panel'><h3>" + ic("info") + "État de la méga-base</h3><div class='sg'>";
      [["Marques", META.counts.b], ["Modèles", META.counts.m], ["Motorisations", META.counts.e], ["Pannes", META.counts.f], ["TSB / rappels", META.counts.t], ["Domaines", META.counts.dom], ["Familles moteur", META.counts.fam], ["Liaisons", META.links], ["Corrélations", META.corr], ["Intégrité", META.integ.pct + " %"], ["Réparations auto", FIXES], ["Poids", META.size + " Ko"]].forEach(function (r) { h += "<div class='sp'><span>" + esc(r[0]) + "</span><b class='hl'>" + fmt(r[1]) + "</b></div>"; }); h += "</div></div>";
    } else if (A.tab === "mega") {
      var q = A.mega.trim().toLowerCase();
      var cands = window.MD_RAW.cand.filter(function (c) { if (!q) return true; return (c.brand + " " + c.model + " " + c.code + " " + c.label + " " + c.note).toLowerCase().indexOf(q) > -1; });
      h += "<div class='card panel' style='margin-bottom:12px'><h3>" + ic("spark") + "Mise à jour massive — recherche & intégration</h3>";
      h += "<p class='muted' style='font-size:12px;margin-bottom:10px'>Catalogue candidats 2025-2027 : nouvelles marques, nouveaux modèles commercialisés et motorisations corrélées. Réservé administrateur. La diffusion aux tiers reste soumise à votre accord.</p>";
      h += "<div class='fr f2'><div><label class='lb'>Recherche candidat</label><input class='inp' type='search' data-mega='q' value='" + esc(A.mega) + "' placeholder='Marque, modèle, code moteur, technologie…'></div>";
      h += "<div><label class='lb'>Corrélation sélection module 2</label><input class='inp' value='" + esc(S.sel.b ? (BIDX[S.sel.b] ? BIDX[S.sel.b].n : "") + " " + (S.sel.m && MIDX[S.sel.m] ? MIDX[S.sel.m].n : "") : "aucune sélection") + "' disabled></div></div>";
      h += "<div style='display:flex;gap:7px;margin-top:10px;flex-wrap:wrap'><button class='btn sm pri' data-act='megaAll'>" + ic("plus") + "Intégrer les " + cands.length + " résultat(s)</button><button class='btn sm ghost' data-act='megaSel'>" + ic("car") + "Filtrer sur la marque sélectionnée</button></div></div>";
      h += "<div class='tw'><table class='t'><thead><tr><th>Type</th><th>Marque</th><th>Modèle / phase</th><th>Motorisation</th><th>Période</th><th>Note</th><th></th></tr></thead><tbody>";
      cands.forEach(function (c) { var bi = BIDX[c.brand]; h += "<tr><td><span class='tag'>" + esc(c.type) + "</span></td><td>" + esc(bi ? bi.n : c.brand) + "</td><td><b>" + esc(c.model) + "</b> <span class='tag'>phase " + c.phase + "</span></td><td class='mono'>" + esc(c.label) + " · " + c.hp + " ch · " + esc(c.code) + "</td><td class='mono'>" + c.y0 + "-" + c.y1 + "</td><td class='dim' style='font-size:11px'>" + esc(c.note) + "</td><td><button class='btn xs pri' data-act='megaAdd' data-i='" + window.MD_RAW.cand.indexOf(c) + "'>Intégrer</button></td></tr>"; });
      h += "</tbody></table></div>";
    } else if (A.tab === "import") {
      h += "<div class='card panel'><h3>" + ic("ul") + "Import universel multi-formats — administrateur seul</h3>";
      h += "<div class='dz' id='dz' data-act='dzPick'>" + ic("ul") + "<div><b>Déposer un fichier</b> ou cliquer</div><div class='dim mono' style='font-size:10px;margin-top:4px'>VALIDATION AVANT ÉCRITURE · FUSION SANS DOUBLON · DIFFUSION SUR ACCORD</div></div>";
      h += "<div class='fmtrow'><span>JSON</span><span>JSONL</span><span>CSV</span><span>TSV</span><span>XML</span><span>YAML</span><span>HTML</span><span>XLSX</span><span>ODS</span><span>JS</span><span>TXT</span></div>";
      h += "<input type='file' id='impFile' style='display:none'>";
      h += "<div style='margin-top:12px'><label class='lb'>…ou coller les données</label><textarea class='inp mono' id='impText' rows='7'></textarea></div>";
      h += "<div id='impReport'></div><div style='display:flex;gap:7px;margin-top:11px;flex-wrap:wrap'><button class='btn ghost sm' data-act='impAnalyze'>" + ic("check") + "Analyser</button><button class='btn pri sm' id='impApply' data-act='impApply' disabled>" + ic("ul") + "Fusionner dans la base</button></div></div>";
    } else if (A.tab === "access") {
      h += "<div class='card panel' style='margin-bottom:12px'><h3>" + ic("users") + "Demandes & sessions tiers<span class='chip'>" + pendingCount() + " en attente</span></h3>";
      h += "<p class='muted' style='font-size:12px;margin-bottom:10px'>Le tiers saisit son prénom et le mot de passe <b class='mono' style='color:#FFD60A'>expert83</b>, puis attend votre validation. Vous acceptez, refusez ou révoquez en temps réel. Le tiers consulte uniquement les fiches techniques et le studio ; il ne peut ni importer, ni exporter, ni mettre à jour, ni sauvegarder localement.</p>";
      if (!REG.users.length) h += "<div class='empty'>" + ic("users") + "<p>Aucune demande pour le moment.</p></div>";
      else {
        h += "<div class='tw'><table class='t'><thead><tr><th>Prénom</th><th>Statut</th><th>Demande</th><th>Dernière action</th><th style='text-align:right'>Décision</th></tr></thead><tbody>";
        REG.users.forEach(function (u) { var col = u.status === "granted" ? "#43E08B" : (u.status === "pending" ? "#FFD60A" : "#FF4D5E"); h += "<tr><td><b>" + esc(u.name) + "</b><div class='dim mono' style='font-size:9px'>" + esc(u.id) + "</div></td><td><span class='tag' style='color:" + col + "'>" + esc(u.status) + "</span></td><td class='mono'>" + new Date(u.ts).toLocaleString("fr-FR") + "</td><td class='mono'>" + (u.at ? new Date(u.at).toLocaleString("fr-FR") : "—") + "</td><td><div style='display:flex;gap:5px;justify-content:flex-end'>"; if (u.status !== "granted") h += "<button class='btn xs grn' data-act='accGrant' data-id='" + u.id + "'>Accepter</button>"; if (u.status === "pending") h += "<button class='btn xs dgr' data-act='accDeny' data-id='" + u.id + "'>Refuser</button>"; if (u.status === "granted") h += "<button class='btn xs dgr' data-act='accRevoke' data-id='" + u.id + "'>Révoquer</button>"; h += "<button class='btn xs ghost' data-act='accDel' data-id='" + u.id + "'>" + ic("trash", "width:11px;height:11px") + "</button></div></td></tr>"; });
        h += "</tbody></table></div>";
      }
      h += "</div><div class='card panel'><h3>" + ic("clock") + "Journal des accès</h3><div class='journal'>";
      if (!REG.log.length) h += "<p class='dim'>Aucune activité.</p>";
      REG.log.slice(0, 30).forEach(function (l) { h += "<div class='jr'><time>" + new Date(l.ts).toLocaleTimeString("fr-FR") + "</time><span>" + esc(l.a) + "</span></div>"; }); h += "</div></div>";
    } else {
      h += "<div class='card panel'><h3>" + ic("clock") + "Journal de la base</h3><div class='journal'>";
      AUDIT.slice().reverse().slice(0, 60).forEach(function (a) { h += "<div class='jr'><time>" + new Date(a.ts).toLocaleString("fr-FR") + "</time><span class='jt'>" + esc(a.type.toUpperCase()) + "</span><span>" + esc(a.msg) + "</span></div>"; });
      h += "</div></div>";
    }
    return h;
  }
  function vDiag() {
    var fl = TESTS.filter(function (t) { return !t.ok && !t.soft; }).length, wn = TESTS.filter(function (t) { return !t.ok && t.soft; }).length;
    var col = fl ? "#FF4D5E" : (wn ? "#FFAF2E" : "#43E08B"), h = "";
    h += "<div class='vh'><div><span class='kick'>MODULE 07 — AUTOVÉRIFICATION</span><h1>DIAGNOSTIC <i>SYSTÈME</i></h1></div><div style='display:flex;gap:7px'><button class='btn sm grn' data-act='runTests'>" + ic("reset") + "Relancer</button>";
    if (isAdmin()) h += "<button class='btn sm amb' data-act='autoFix'>" + ic("tool") + "Auto-réparation</button>"; h += "</div></div>";
    h += "<div class='card panel' style='margin-bottom:12px;border-left:3px solid " + col + "'><h3>" + ic("stetho", "color:" + col) + "Résultat<span class='chip' style='color:" + col + ";border-color:" + col + "'>" + (TESTS.length - fl) + "/" + TESTS.length + " OK</span></h3>";
    h += "<p class='muted'>" + (fl ? "<b style='color:#FF4D5E'>" + fl + " test(s) bloquant(s).</b>" : "<b style='color:#43E08B'>Système opérationnel — aucune erreur au démarrage.</b>") + (wn ? " " + wn + " avertissement(s) non bloquant(s)." : "") + (FIXES ? " <span class='mono' style='color:#43E08B'>" + FIXES + " réparation(s) automatique(s).</span>" : "") + "</p></div>";
    h += "<div class='card panel'><h3>" + ic("check") + "Détail des contrôles</h3><div class='tests'>";
    TESTS.forEach(function (t) { var c = t.ok ? "#43E08B" : (t.soft ? "#FFAF2E" : "#FF4D5E"); h += "<div class='tst' style='--tc:" + c + "'><span class='ti'>" + (t.ok ? "OK" : (t.soft ? "!" : "X")) + "</span><div style='flex:1'><b>" + esc(t.n) + "</b><small>" + esc(t.info) + "</small></div></div>"; });
    h += "</div></div>"; return h;
  }
  function render() {
    var v = S.view, m = $("#view"); if (v !== "studio") WP.detach();
    $$(".nv,#tabs a").forEach(function (a) { a.classList.toggle("on", a.dataset.v === v); });
    var h = ""; try { h = v === "bord" ? vBord() : v === "explorer" ? vExplorer() : v === "tech" ? vTech() : v === "entretien" ? vEntretien() : v === "studio" ? vStudio() : v === "admin" ? vAdmin() : vDiag(); }
    catch (e) { logErr("render " + v, e); h = "<div class='card panel'><h3>" + ic("alert") + "Erreur de rendu</h3><p class='muted'>" + esc(e.message) + "</p></div>"; }
    m.innerHTML = h; mountAnim(m); updateMeta();
    if (v === "studio") { var cv = $("#pv"); if (cv) { WP.attach(cv); WP.fx(); WP.sync(); } }
  }
  function TIERNAME() { var u = tierUser(); return u ? u.name : ""; }
  function updateMeta() {
    var c = META.counts;
    $("#nEng").textContent = fmt(c.e); $("#nTech").textContent = fmt(c.f + c.t); $("#nPlan").textContent = fmt(c.dom);
    $("#stLinks").textContent = fmt(META.links); $("#stCorr").textContent = fmt(META.corr); $("#stInt").textContent = META.integ.pct + "%"; $("#stSize").textContent = META.size + " Ko";
    $("#stDiff").textContent = isAdmin() ? (REG.live ? "AUTO rév." + REG.rev : "MANUEL rév." + (REG.rev || 0)) : (isTier() ? "LECTURE rév." + (REG.rev || 0) : "—");
    var fl = TESTS.filter(function (t) { return !t.ok && !t.soft; }).length;
    $("#stTest").textContent = TESTS.length ? ((TESTS.length - fl) + "/" + TESTS.length) : "—"; $("#nTest").textContent = TESTS.length ? (fl ? "!" : "OK") : "—";
    $("#diagb").classList.toggle("on", TESTS.length > 0 && fl === 0);
    $("#ichip").className = "chip " + (META.integ.ok ? "ok" : "bad"); $("#itxt").textContent = META.integ.ok ? "INTÈGRE" : "ERREURS " + META.integ.err.length;
    $("#admb").innerHTML = ic(isAdmin() ? "unlock" : "lock"); $("#admb").classList.toggle("on", isAdmin());
    $("#rtxt").textContent = isAdmin() ? "Administrateur ING-3 — imports, exports, mises à jour massives et diffusion." : (isTier() ? "Tiers " + TIERNAME() + " — lecture seule, sans import ni export ni sauvegarde." : "Session non ouverte.");
    $("#sndb").innerHTML = ic(PREF.sound ? "snd" : "mute"); $("#sndb").classList.toggle("on", PREF.sound);
    var nb = $("#navBdg"), pc = pendingCount(); if (nb) { nb.hidden = !(isAdmin() && pc > 0); nb.textContent = pc; }
    var na = $("#navAdmin"); if (na) na.style.display = isTier() ? "none" : "";
    updStor();
  }
  function updStor() { var k = META.size || 0, b = $("#sbar"), t = $("#stxt"); if (b) b.style.width = clamp(k / 8192 * 100, 2, 100) + "%"; if (t) t.textContent = k + " Ko · " + (isAdmin() ? (STORE.local ? "local" : "mémoire") + " · " + (LASTSAVE ? new Date(LASTSAVE).toLocaleTimeString("fr-FR") : "—") : "tiers : aucun stockage"); }

  function pick(r, names) { var i; for (i = 0; i < names.length; i++) { var v = r[names[i]]; if (v !== undefined && v !== null && v !== "") return v; } var map = {}, ks = Object.keys(r); for (i = 0; i < ks.length; i++) map[nk(ks[i])] = r[ks[i]]; for (i = 0; i < names.length; i++) { var w = nk(names[i]); if (map[w] !== undefined && map[w] !== null && map[w] !== "") return map[w]; } return undefined; }
  var COLL = {};[["brands", ["brands", "marques", "constructeurs", "makers"]], ["models", ["models", "modeles", "vehicles", "vehicules", "cars"]], ["engines", ["engines", "motorisations", "moteurs", "powertrains"]], ["faults", ["faults", "pannes", "fiches", "defects", "problemes"]], ["tsb", ["tsb", "bulletins", "campagnes", "rappels", "recalls"]]].forEach(function (p) { p[1].forEach(function (k) { COLL[nk(k)] = p[0]; }); });
  var IGN = { counts: 1, domaines: 1, domains: 1, categories: 1, meta: 1, metadata: 1, app: 1, exportversion: 1, exportedat: 1, version: 1, revisions: 1, plans: 1, entretien: 1, maintenance: 1 };
  function detectKind(r) { if (!r || typeof r !== "object") return null; if (pick(r, ["hp", "power", "puissance", "ch", "puissance_ch", "kw"]) !== undefined || pick(r, ["code_moteur", "engine_code"]) !== undefined) return "engines"; if (pick(r, ["ref", "reference", "numero"]) !== undefined && pick(r, ["date", "published"]) !== undefined) return "tsb"; if (pick(r, ["sev", "severity", "severite", "gravite", "criticite"]) !== undefined) return "faults"; if (pick(r, ["segment", "carrosserie"]) !== undefined) return "models"; if (pick(r, ["marque", "brand", "make"]) !== undefined && pick(r, ["modele", "model", "nom", "name"]) !== undefined) return "models"; if (pick(r, ["pays", "country"]) !== undefined) return "brands"; return null; }
  function classify(data) { var g = {}, ig = []; function consider(key, arr) { if (IGN[key]) { ig.push(key); return; } var k = COLL[key] || null; if (!k && arr.length) k = detectKind(arr[0]); if (!k) { ig.push(key); return; } if (!g[k]) g[k] = []; g[k] = g[k].concat(arr); } (function scan(o) { if (!o || typeof o !== "object" || Array.isArray(o)) return; Object.keys(o).forEach(function (k) { var v = o[k], key = nk(k); if (Array.isArray(v)) { if (v.length) consider(key, v); } else if (v && typeof v === "object") scan(v); }); })(data); return { groups: g, ignored: ig }; }
  function mapRec(r, kind) {
    if (kind === "brands") { var n = pick(r, ["n", "name", "nom", "marque", "brand", "make"]); if (!n) throw "nom manquant"; var pays = String(pick(r, ["pays", "country", "origine"]) || "—"); return { id: String(pick(r, ["id", "uid", "key"]) || ("B-" + slug(n))), n: String(n).trim(), pays: pays, grp: String(pick(r, ["grp", "group", "alliance"]) || "—"), region: String(pick(r, ["region"]) || regionOf(pays)) }; }
    if (kind === "models") { var mn = pick(r, ["n", "name", "nom", "model", "modele", "label"]); if (!mn) throw "nom manquant"; var br = pick(r, ["b", "brand", "marque", "make"]); if (!br) throw "marque manquante"; return { id: String(pick(r, ["id", "uid", "key"]) || ("M-" + slug(br) + "-" + slug(mn))), b: String(br).trim(), bRaw: String(br).trim(), n: String(mn).trim(), y: [+(pick(r, ["y0", "annee_debut", "from"]) || 2017), +(pick(r, ["y1", "annee_fin", "to"]) || YMAX)], seg: String(pick(r, ["seg", "segment", "carrosserie"]) || "Compacte"), phase: +(pick(r, ["phase", "generation", "gen"]) || 1) }; }
    if (kind === "engines") { var code = pick(r, ["code", "code_moteur", "engine_code"]); if (!code) throw "code manquant"; var fam = pick(r, ["fam", "family", "famille"]) || code, lab = pick(r, ["label", "name", "nom", "designation"]); if (!lab) throw "libellé manquant"; var fu = nfuel(pick(r, ["fuel", "energie", "carburant"])), hp = +(pick(r, ["hp", "power", "puissance", "ch", "puissance_ch"]) || 0), kw = +(pick(r, ["kw", "puissance_kw"]) || 0); if (!hp && kw) hp = Math.round(kw * 1.3596); if (!(hp > 0 && hp <= 3000)) throw "puissance invalide"; var mr = split(pick(r, ["m", "models", "modeles", "modele", "model", "vehicle"])); if (!mr.length) { var mb = pick(r, ["marque", "brand"]), mo = pick(r, ["modele", "model"]); if (mb && mo) mr = [mb + " " + mo]; else if (mo) mr = [String(mo)]; } if (!mr.length) throw "aucun modèle lié"; return { id: "", m: [], mRaw: mr, code: String(code).trim(), fam: String(fam).trim(), label: String(lab).trim(), fuel: fu, disp: +(pick(r, ["disp", "cylindree", "cm3"]) || 0), hp: Math.round(hp), nm: +(pick(r, ["nm", "torque", "couple"]) || 0), kw: Math.round(hp * 0.7355), y: [+(pick(r, ["y0", "annee_debut", "from"]) || 2017), +(pick(r, ["y1", "annee_fin", "to"]) || YMAX)], gb: String(pick(r, ["gb", "boite", "transmission"]) || "BVM"), norm: fu === "b" ? "ZE" : "Euro 6", cyl: fu === "b" ? "ÉLEC" : "L4", asp: fu === "b" ? "—" : "Turbo", inj: fu === "b" ? "—" : (fu === "d" ? "Common Rail" : "Injection directe") }; }
    if (kind === "faults") { var t = pick(r, ["t", "title", "titre", "name", "nom", "panne"]); if (!t) throw "titre manquant"; var c0 = +(pick(r, ["cost0", "cout_min"]) || 0), c1 = +(pick(r, ["cost1", "cout_max"]) || c0); return { id: "", t: String(t).trim(), fam: split(pick(r, ["fam", "families", "familles", "moteurs"])), mt: split(pick(r, ["mt", "modeles", "models", "vehicules"])), ph: split(pick(r, ["ph", "phases", "generation"])), sev: nsev(pick(r, ["sev", "severity", "severite", "criticite"])), freq: nfreq(pick(r, ["freq", "frequence"])), y: [+(pick(r, ["y0", "annee_debut"]) || 2017), +(pick(r, ["y1", "annee_fin"]) || YMAX)], km: [+(pick(r, ["km0", "km_min"]) || 0), +(pick(r, ["km1", "km_max"]) || 200000)], sym: split(String(pick(r, ["sym", "symptoms", "symptomes"]) || "").replace(/\n/g, "|")), cause: String(pick(r, ["cause", "origine"]) || ""), fix: String(pick(r, ["fix", "solution", "action", "reparation"]) || ""), cost: [c0, Math.max(c0, c1)], status: String(pick(r, ["status", "statut"]) || "Surveillance"), dom: String(pick(r, ["dom", "domaine", "domain", "cat"]) || "Moteur"), fuel: "" }; }
    if (kind === "tsb") { var tr = pick(r, ["ref", "reference", "numero"]); if (!tr) throw "référence manquante"; var tt = pick(r, ["t", "title", "titre", "nom", "objet"]); if (!tt) throw "titre manquant"; return { id: "", ref: String(tr).trim(), b: split(pick(r, ["b", "brands", "marques"])), bRaw: split(pick(r, ["b", "brands", "marques"])), fam: split(pick(r, ["fam", "families", "familles"])), mt: split(pick(r, ["mt", "modeles", "models"])), ph: split(pick(r, ["ph", "phases"])), t: String(tt).trim(), date: String(pick(r, ["date", "published"]) || "2026-01").slice(0, 7), cat: String(pick(r, ["cat", "category", "categorie", "type"]) || "Moteur"), sev: nsev(pick(r, ["sev", "severity", "severite"])), sum: String(pick(r, ["sum", "summary", "resume", "description"]) || ""), act: String(pick(r, ["act", "action", "procedure"]) || ""), dom: String(pick(r, ["dom", "domaine"]) || pick(r, ["cat", "categorie"]) || "Moteur") }; }
    throw "type inconnu";
  }
  function resolveAll(groups) {
    var warn = [], drop = [], newB = [], newM = [], bIdx = {}, bName = {}, mIdx = {}, mName = {}, seen = {};
    DB.brands.forEach(function (b) { bIdx[b.id] = b.id; bName[nk(b.n)] = b.id; });
    DB.models.forEach(function (m) { mIdx[m.id] = m.id; mName[nk(m.n)] = m.id; });
    function uniq(kind, base) { var id = base, i = 2; while (seen[kind + ":" + id] || DB[kind].some(function (x) { return x.id === id; })) { id = base + "-" + i; i++; } seen[kind + ":" + id] = 1; return id; }
    function bid(raw) { if (raw == null || raw === "") return null; var r = String(raw).trim(); if (bIdx[r]) return bIdx[r]; var l = nk(r); if (bName[l]) return bName[l]; var id = uniq("brands", "B-" + slug(r)); bIdx[id] = id; bName[l] = id; newB.push({ id: id, n: r, pays: "—", grp: "—", region: "europe" }); warn.push("marque créée : " + r); return id; }
    function mid(raw) { var r = String(raw == null ? "" : raw).trim(); if (!r) return null; if (mIdx[r]) return mIdx[r]; var l = nk(r); if (mName[l]) return mName[l]; var b = null, rest = r; Object.keys(bName).forEach(function (k) { if (!b && l.indexOf(k) === 0 && l.length > k.length + 2) { b = bName[k]; rest = r.slice(k.length).replace(/^[\s\-:]+/, ""); } }); b = b || bid("Import"); var id = uniq("models", "M-" + slug(rest || r)); mIdx[id] = id; mName[nk(rest || r)] = id; newM.push({ id: id, b: b, n: rest || r, y: [2017, YMAX], seg: "Compacte", phase: 1 }); warn.push("modèle créé : " + (rest || r)); return id; }
    var out = { brands: [], models: [], engines: [], faults: [], tsb: [] };
    (groups.brands || []).forEach(function (r) { r.id = r.id || uniq("brands", "B-" + slug(r.n)); bIdx[r.id] = r.id; bName[nk(r.n)] = bName[nk(r.n)] || r.id; out.brands.push(r); });
    (groups.models || []).forEach(function (r) { var b = bid(r.bRaw || r.b); if (!b) { drop.push("models " + r.n); return; } r.b = b; delete r.bRaw; r.id = r.id || uniq("models", "M-" + slug(b) + "-" + slug(r.n)); mIdx[r.id] = r.id; mName[nk(r.n)] = mName[nk(r.n)] || r.id; out.models.push(r); });
    (groups.engines || []).forEach(function (r) { var ms = (r.mRaw || []).map(mid).filter(Boolean); if (!ms.length) { drop.push("engines " + r.label); return; } r.m = ms; delete r.mRaw; r.id = r.id || uniq("engines", "E-" + slug(r.code) + "-" + slug(r.label)); out.engines.push(r); });
    (groups.faults || []).forEach(function (r) { r.id = r.id || uniq("faults", "F-" + slug(r.t)); out.faults.push(r); });
    (groups.tsb || []).forEach(function (r) { r.b = (r.bRaw || r.b || []).map(bid).filter(Boolean); delete r.bRaw; r.id = r.id || uniq("tsb", "T-" + slug(r.ref)); out.tsb.push(r); });
    out.brands = newB.concat(out.brands); out.models = newM.concat(out.models);
    return { out: out, warn: warn, drop: drop };
  }
  var KEYFN = { brands: function (x) { return nk(x.n); }, models: function (x) { return nk(x.b + "|" + x.n); }, engines: function (x) { return nk(x.code + "|" + x.fam + "|" + x.label + "|" + x.hp); }, faults: function (x) { return nk(x.t); }, tsb: function (x) { return nk(x.ref || x.t); } };
  function upsert(kind, rec) { var arr = DB[kind], ex = null, i; if (rec.id) for (i = 0; i < arr.length; i++) if (arr[i].id === rec.id) { ex = arr[i]; break; } if (!ex) { var k = KEYFN[kind](rec); for (i = 0; i < arr.length; i++) if (KEYFN[kind](arr[i]) === k) { ex = arr[i]; break; } } if (ex) { Object.keys(rec).forEach(function (kk) { var v = rec[kk]; if (v == null || v === "") return; if (Array.isArray(v)) { if (v.length) ex[kk] = v; } else ex[kk] = v; }); return "upd"; } if (!rec.id || arr.some(function (x) { return x.id === rec.id; })) rec.id = uid(kind.charAt(0).toUpperCase()); arr.push(rec); return "add"; }
  function parseDelim(text) { var first = text.split(/\r?\n/)[0] || "", cands = [[";", 0], [",", 0], ["\t", 0], ["|", 0]]; cands.forEach(function (c) { c[1] = first.split(c[0]).length - 1; }); cands.sort(function (a, b) { return b[1] - a[1]; }); var d = cands[0][1] > 0 ? cands[0][0] : ",", rows = [], row = [], cur = "", q = false, i; for (i = 0; i < text.length; i++) { var ch = text[i]; if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; } else if (ch === '"') q = true; else if (ch === d) { row.push(cur); cur = ""; } else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cur); cur = ""; if (row.some(function (x) { return x.trim() !== ""; })) rows.push(row); row = []; } else cur += ch; } row.push(cur); if (row.some(function (x) { return x.trim() !== ""; })) rows.push(row); if (rows.length < 2) return []; var head = rows[0].map(function (x) { return x.trim().replace(/^\uFEFF/, ""); }); return rows.slice(1).map(function (r) { var o = {}; head.forEach(function (k, i2) { o[k] = r[i2] === undefined ? "" : r[i2]; }); return o; }); }
  function parseXML(text) { var doc = new DOMParser().parseFromString(text, "application/xml"); if (doc.getElementsByTagName("parsererror").length) throw "XML invalide"; var kids = [].slice.call(doc.documentElement.children); if (!kids.length) throw "XML vide"; var tc = {}; kids.forEach(function (k) { tc[k.tagName] = (tc[k.tagName] || 0) + 1; }); var best = null, bn = 0; Object.keys(tc).forEach(function (t) { if (tc[t] > bn) { bn = tc[t]; best = t; } }); var out = []; kids.forEach(function (k) { if (k.tagName !== best) return; var o = {};[].slice.call(k.attributes).forEach(function (a) { o[a.name] = a.value; });[].slice.call(k.children).forEach(function (c) { o[c.tagName] = c.textContent.trim(); }); if (!Object.keys(o).length) o[k.tagName] = k.textContent.trim(); out.push(o); }); return out; }
  function parseYAML(text) { var lines = text.split(/\r?\n/), out = [], cur = null; lines.forEach(function (l) { if (!l.trim() || /^\s*#/.test(l)) return; var m = l.match(/^\s*-\s*(.*)$/); if (m) { if (cur) out.push(cur); cur = {}; var kv = m[1].match(/^([^:]+):\s*(.*)$/); if (kv) cur[kv[1].trim()] = kv[2].trim(); return; } var k2 = l.match(/^\s+([^:]+):\s*(.*)$/); if (k2 && cur) { cur[k2[1].trim()] = k2[2].trim(); return; } var k3 = l.match(/^([^:]+):\s*(.*)$/); if (k3 && cur) cur[k3[1].trim()] = k3[2].trim(); }); if (cur) out.push(cur); return out; }
  function parseHTML(text) { var doc = new DOMParser().parseFromString(text, "text/html"), tbs = doc.querySelectorAll("table"); if (!tbs.length) throw "aucun tableau HTML"; var out = []; for (var t = 0; t < tbs.length; t++) { var trs = tbs[t].querySelectorAll("tr"); if (trs.length < 2) continue; var head = [].slice.call(trs[0].children).map(function (c) { return c.textContent.trim(); }); for (var r = 1; r < trs.length; r++) { var cs = [].slice.call(trs[r].children), o = {}; head.forEach(function (k, i) { o[k] = cs[i] ? cs[i].textContent.trim() : ""; }); out.push(o); } } return out; }
  function sniff(name, text) { var ext = String(name || "").toLowerCase().split(".").pop(), t = String(text || "").trim(); if (ext === "json" || t.charAt(0) === "{" || t.charAt(0) === "[") try { return { fmt: "JSON", data: JSON.parse(t) }; } catch (e) {} if (ext === "jsonl" || ext === "ndjson") { var a = []; t.split(/\r?\n/).forEach(function (l) { if (l.trim()) try { a.push(JSON.parse(l)); } catch (e) {} }); if (a.length) return { fmt: "JSONL", records: a }; } if (ext === "xml" || /^<\?xml/.test(t) || /^<[a-zA-Z]/.test(t)) { if (/<table[\s>]/i.test(t)) return { fmt: "HTML", records: parseHTML(t) }; return { fmt: "XML", records: parseXML(t) }; } if (ext === "html" || ext === "htm") return { fmt: "HTML", records: parseHTML(t) }; if (ext === "yaml" || ext === "yml" || /^\s*-\s+\w+\s*:/.test(t)) return { fmt: "YAML", records: parseYAML(t) }; if (ext === "js") { var s = t.replace(/^\s*window\.[A-Za-z0-9_]+\s*=\s*/, "").replace(/^\s*(export\s+default|module\.exports\s*=)\s*/, "").replace(/;\s*$/, ""); try { return { fmt: "JS", data: JSON.parse(s) }; } catch (e) {} try { return { fmt: "JS", data: (new Function("return " + s))() }; } catch (e2) {} } if (/[;,\t|]/.test(t.split(/\r?\n/)[0] || "")) return { fmt: ext === "tsv" ? "TSV" : "CSV", records: parseDelim(t) }; throw "format non reconnu"; }
  function analyzePayload(parsed, label) { if (!isAdmin()) { toast("err", "Import refusé", "Réservé à l'administrateur."); return; } var rep = $("#impReport"), groups = {}, rej = [], ig = []; if (parsed.data !== undefined) { var d = parsed.data; if (Array.isArray(d)) { var k = detectKind(d[0] || {}); if (k) groups[k] = d; } else if (d && typeof d === "object") { var cl = classify(d); groups = cl.groups; ig = cl.ignored; } } else if (parsed.records) { var k2 = detectKind(parsed.records[0] || {}); if (k2) groups[k2] = parsed.records; } if (!Object.keys(groups).length) { rep.innerHTML = "<div class='rep rj'>Aucune collection reconnue. Attendu : marques, modeles, motorisations, fiches/pannes, tsb/rappels.</div>"; beep("err"); return; } var mapped = {}; Object.keys(groups).forEach(function (k) { mapped[k] = []; groups[k].forEach(function (r, i) { try { mapped[k].push(mapRec(r, k)); } catch (e) { rej.push(k + "[" + i + "] : " + e); } }); }); var R = resolveAll(mapped), ok = 0; Object.keys(R.out).forEach(function (k) { ok += R.out[k].length; }); IMPORT = { R: R }; var h = "<div class='rep'><b class='ok'>" + ok + " enregistrement(s) prêt(s)</b> · <b class='rj'>" + (rej.length + R.drop.length) + " rejeté(s)</b> · <b class='wn'>" + R.warn.length + " création(s) auto</b>"; h += "<div class='mono' style='font-size:10px;margin-top:6px;color:#25D4EE'>Format : " + esc(parsed.fmt) + (label ? " · " + esc(label) : "") + "</div>"; Object.keys(R.out).forEach(function (k) { if (R.out[k].length) h += "<div class='mono' style='font-size:10px;margin-top:3px;color:#25D4EE'>" + k + " ← " + R.out[k].length + "</div>"; }); if (ig.length) h += "<p class='wn' style='margin-top:7px'>Métadonnées ignorées : " + esc(ig.slice(0, 6).join(", ")) + "</p>"; if (rej.length) { h += "<ul>"; rej.slice(0, 8).forEach(function (r) { h += "<li class='rj'>" + esc(r) + "</li>"; }); h += "</ul>"; } if (R.warn.length) { h += "<ul>"; R.warn.slice(0, 8).forEach(function (r) { h += "<li class='wn'>" + esc(r) + "</li>"; }); h += "</ul>"; } rep.innerHTML = h + "</div>"; $("#impApply").disabled = ok === 0; beep(ok ? "ok" : "err"); }
  function applyImport() { if (!isAdmin()) { toast("err", "Import refusé", "Réservé à l'administrateur."); return; } if (!IMPORT) return; snapshot("import"); var ins = 0, upd = 0;["brands", "models", "engines", "faults", "tsb"].forEach(function (k) { (IMPORT.R.out[k] || []).forEach(function (r) { if (upsert(k, r) === "add") ins++; else upd++; }); }); var n = ins + upd; IMPORT = null; closeModal(); mutate("imp", "Import : " + ins + " ajouts, " + upd + " mises à jour"); saveNow(); toast("ok", "Import fusionné", n + " enregistrement(s) · " + fmt(META.counts.e) + " motorisations. " + (REG.live ? "Diffusé automatiquement." : "Diffusion manuelle disponible."), true); beep("imp"); }
  function megaAddSilent(idx) { var c = window.MD_RAW.cand[idx]; if (!c) return; var bi = DB.brands.filter(function (b) { return b.id === c.brand; })[0]; if (!bi) { DB.brands.push({ id: c.brand, n: c.brand.charAt(0).toUpperCase() + c.brand.slice(1), pays: "—", grp: "—", region: "europe" }); reindex(); } var mid2 = c.brand + "-" + slug(c.model), m = MIDX[mid2]; if (!m) { DB.models.push({ id: mid2, b: c.brand, n: c.model, y: [c.y0, c.y1], seg: SEGS[c.seg] || "Compacte", phase: c.phase }); reindex(); m = MIDX[mid2]; } if (DB.engines.some(function (e) { return e.m.indexOf(mid2) > -1 && e.code === c.code && e.hp === c.hp; })) return; var y0 = Math.max(c.y0, m.y[0]), y1 = Math.min(c.y1, m.y[1]); if (y0 > y1) { y0 = m.y[0]; y1 = m.y[1]; } DB.engines.push(mkEng(DB.engines.length + 1, mid2, c.code, c.code, c.label, nfuel(c.fuel), c.disp, c.hp, c.nm, y0, y1, c.gb)); }
  function megaAdd(idx) { if (!isAdmin()) { toast("err", "Mise à jour refusée", "Réservé à l'administrateur."); return; } var c = window.MD_RAW.cand[idx]; if (!c) return; megaAddSilent(idx); mutate("mega", "Méga-base : " + c.model + " " + c.label + " " + c.hp + " ch"); toast("ok", "Candidat intégré", c.model + " · " + c.label + " " + c.hp + " ch" + (REG.live ? " — diffusé." : " — en attente de diffusion.")); beep("ok"); }

  function runTests() {
    var T = [], add = function (n, ok, i, s) { T.push({ n: n, ok: !!ok, info: i || "", soft: !!s }); };
    add("Base chargée", !!DB && DB.engines.length > 0, DB ? fmt(DB.engines.length) + " motorisations" : "ABSENTE");
    add("Marques toutes régions", DB.brands.length >= 80 && Object.keys(META.regions).length >= 5, DB.brands.length + " marques · " + Object.keys(META.regions).length + " régions");
    add("Modèles à phases", DB.models.length >= 400 && DB.models.every(function (m) { return m.phase >= 1; }), DB.models.length + " modèles");
    add("Motorisations", DB.engines.length >= 1200, fmt(DB.engines.length) + " motorisations");
    add("Pannes détaillées", DB.faults.length >= 110, DB.faults.length + " fiches");
    add("TSB & rappels", DB.tsb.length >= 90, DB.tsb.length + " bulletins dont " + META.counts.rc + " rappels");
    add("Domaines techniques", META.counts.dom >= 20, META.counts.dom + " domaines");
    var orphan = 0; DB.engines.forEach(function (e) { e.m.forEach(function (i) { if (!MIDX[i]) orphan++; }); });
    add("Références moteur-modèle", orphan === 0, orphan + " orphelin(s)");
    var noEng = DB.models.filter(function (m) { return !DB.engines.some(function (e) { return e.m.indexOf(m.id) > -1; }); }).length;
    add("Couverture modèles", noEng === 0, noEng + " modèle(s) sans motorisation");
    var badSev = DB.faults.filter(function (f) { return !SV[f.sev]; }).length;
    add("Sévérités normalisées", badSev === 0, badSev ? badSev + " invalide(s)" : "toutes valides");
    var e0 = DB.engines.filter(function (e) { return /EB2ADTX|DV5RUCd/.test(e.code); })[0], planOk = false, planLen = 0;
    if (e0) { var pl = buildPlan(e0, modelOf(e0), brandOf(e0)); planLen = pl.visits.length; planOk = pl.visits[pl.visits.length - 1].km >= KMMAX; }
    add("Plan 200 000 km", planOk, planLen + " révisions programmées");
    var p3008 = DB.models.filter(function (m) { return m.n.indexOf("3008 II Phase 2") > -1; }).length;
    add("Pack 3008 II Phase 2", p3008 > 0, p3008 + " modèle(s)");
    var sOk = false; try { sOk = omniSearch("3008 courroie").length > 0; } catch (e) {}
    add("Recherche prédictive", sOk, "3008 courroie → résultats");
    var rOk = false; try { rOk = omniSearch("3008 rappel").some(function (h) { return h.badge === "RAPPEL"; }); } catch (e) {}
    add("Recherche rappels", rOk, "3008 rappel → campagnes");
    var regOk = false; try { regOk = omniSearch("Chine").length > 0 && omniSearch("Japon").length > 0; } catch (e) {}
    add("Recherche toutes régions", regOk, "Chine / Japon / Europe / USA");
    var dtcOk = false; try { dtcOk = omniSearch("P20E8").length > 0; } catch (e) {}
    add("Recherche codes défaut", dtcOk, "P20E8 → AdBlue SCR");
    var dm = ["#view", "#rail", "#top", "#dr", "#md", "#ts", "#bgc", "#omni", "#omnires", "#gate"].filter(function (s) { return !$(s); });
    add("DOM critique", dm.length === 0, dm.length ? dm.join(", ") : "10/10 présents");
    var cv = document.createElement("canvas"), cx = safe("tctx", function () { return cv.getContext("2d"); }, null);
    add("Canvas 2D", !!cx, cx ? "OK" : "indisponible", true);
    add("Scènes studio", WP.MODES.length >= 8, WP.MODES.length + " scènes");
    add("Stockage", STORE.local, STORE.local ? "localStorage" : "mémoire", true);
    add("Session", STORE.session, STORE.session ? "sessionStorage" : "mémoire", true);
    add("Canal temps réel", !!CH, CH ? "BroadcastChannel actif" : "repli storage + polling", true);
    add("Mot de passe tiers", TPWD === "expert83", "expert83 requis pour demander l'accès");
    add("Exports admin seul", !isTier(), isTier() ? "tiers : exports bloqués" : "administrateur ou portail");
    var vb = [];[["bord", vBord], ["explorer", vExplorer], ["tech", vTech], ["entretien", vEntretien], ["studio", vStudio], ["admin", vAdmin], ["diagnostic", vDiag]].forEach(function (v) { try { var hh = v[1](); if (typeof hh !== "string" || hh.length < 1) vb.push(v[0]); } catch (e) { vb.push(v[0] + " (" + e.message + ")"); } });
    add("Rendu des 7 vues", vb.length === 0, vb.length ? vb.join(", ") : "7/7 rendues");
    add("Intégrité référentielle", META.integ.ok, META.integ.err.length ? META.integ.err.slice(0, 3).join(" | ") : "0 erreur");
    add("Sauvegarde admin", !isAdmin() || LASTSAVE > 0, isAdmin() ? (LASTSAVE ? new Date(LASTSAVE).toLocaleTimeString("fr-FR") : "en attente") : "tiers : stockage interdit");
    add("Exceptions", ERRORS.length === 0, ERRORS.length ? ERRORS.slice(-3).map(function (e) { return e.m; }).join(" | ") : "aucune", true);
    TESTS = T; updateMeta(); return T;
  }
  function autoFix() { if (!isAdmin()) return; var did = []; if (!META.integ.ok || !DB.engines.length) { DB = clone(SEED); did.push("base réinjectée"); } var f = sanitize(DB); if (f) did.push(f + " réparation(s)"); if (WP.fails > 0) { WP.P.mode = "grid"; WP.fails = 0; WP.apply(); did.push("graphique réinitialisé"); } ERRORS.length = 0; did.push("journal purgé"); recompute(); saveNow(); runTests(); updateMeta(); render(); toast("ok", "Auto-réparation", did.join(" · ")); beep("ok"); }

  function gateHTML(mode) {
    var h = "";
    h += "<div class='gcard2'><h1>MECADATA <i>//</i> PORTAIL D'ACCÈS</h1><p class='gsub'>Méga-base technique 2017→2027 — choisissez votre mode d'ouverture. Le mot de passe résiduel est effacé à chaque lancement.</p>";
    if (!mode) {
      h += "<div class='gmodes'><div class='gmode' data-act='gateAdmin'><div class='gi'>" + ic("shield", "width:26px;height:26px") + "</div><h3>ADMINISTRATEUR</h3><p>Accès complet : imports, exports, mises à jour massives, méga-base, gestion des accès tiers et diffusion temps réel.</p></div>";
      h += "<div class='gmode' data-act='gateTier'><div class='gi'>" + ic("users", "width:26px;height:26px") + "</div><h3>TIERS</h3><p>Mot de passe <b class='mono' style='color:#FFD60A'>expert83</b> puis validation administrateur. Consultation des fiches, pannes, rappels, TSB et plans d'entretien. Studio fond d'écran. Aucun import, aucun export, aucune mise à jour, aucune sauvegarde locale.</p></div></div>";
      h += "<p class='gnote'>Session administrateur protégée · accès tiers par mot de passe expert83 et accord de l'administrateur</p>";
    } else if (mode === "admin") {
      h += "<div class='gform'><label class='lb'>Mot de passe administrateur</label>";
      h += "<form data-form='admin'><input class='inp mono' type='password' name='pwd' id='gatePwd' value='' placeholder='••••••••' autocomplete='new-password' style='text-align:center;letter-spacing:.2em;font-size:16px'>";
      h += "<div style='display:flex;gap:8px;margin-top:11px'><button type='button' class='btn ghost' data-act='gateBack'>Retour</button><button type='submit' class='btn pri' style='flex:1'>" + ic("unlock") + "OUVRIR LA SESSION ING-3</button></div></form>";
      h += "<p class='gnote'>Champ réinitialisé à chaque lancement — aucun mot de passe n'est conservé.</p></div>";
    } else {
      var u = tierUser();
      if (u && u.status === "granted") { h += "<div class='gform'><div class='gwait'><div class='gi' style='width:52px;height:52px;margin:0 auto 12px;display:grid;place-items:center;border-radius:15px;background:rgba(67,224,139,.14);border:1px solid rgba(67,224,139,.45);color:#43E08B'>" + ic("check", "width:24px;height:24px") + "</div><h3 style='font:600 15px var(--gd)'>Accès accordé — " + esc(u.name) + "</h3><p class='muted' style='font-size:12px;margin:7px 0 13px'>L'administrateur a validé votre demande. Consultation en lecture seule.</p><button class='btn pri' data-act='tierEnter'>" + ic("unlock") + "ENTRER EN CONSULTATION</button><div style='margin-top:9px'><button class='btn sm ghost' data-act='gateBack'>Retour</button></div></div></div>"; }
      else if (u && u.status === "pending") { h += "<div class='gform'><div class='gwait'><div class='spin'></div><h3 style='font:600 15px var(--gd)'>Demande envoyée — " + esc(u.name) + "</h3><p class='muted' style='font-size:12px;margin-top:7px'>En attente de validation par l'administrateur. Cet écran se met à jour automatiquement dès la décision.</p><button class='btn sm ghost' data-act='tierCancel' style='margin-top:12px'>Annuler la demande</button></div></div>"; }
      else if (u && u.status !== "granted") { h += "<div class='gform'><div class='gwait'><h3 style='font:600 15px var(--gd);color:#FF4D5E'>Accès " + esc(u.status === "denied" ? "refusé" : "révoqué") + "</h3><p class='muted' style='font-size:12px;margin:7px 0 12px'>L'administrateur a " + (u.status === "denied" ? "refusé" : "révoqué") + " cet accès. Vous pouvez soumettre une nouvelle demande avec le mot de passe tiers.</p><button class='btn sm ghost' data-act='tierReset'>Nouvelle demande</button> <button class='btn sm ghost' data-act='gateBack'>Retour</button></div></div>"; }
      else {
        h += "<div class='gform'><label class='lb'>Votre prénom</label><form data-form='tier'><input class='inp' type='text' name='name' id='gateName' maxlength='24' placeholder='Prénom' autocomplete='off' style='text-align:center;font-size:15px'>";
        h += "<label class='lb' style='margin-top:10px'>Mot de passe tiers</label><input class='inp mono' type='password' name='tpwd' id='gateTierPwd' value='' placeholder='••••••••' autocomplete='new-password' style='text-align:center;letter-spacing:.2em;font-size:16px'>";
        h += "<div style='display:flex;gap:8px;margin-top:11px'><button type='button' class='btn ghost' data-act='gateBack'>Retour</button><button type='submit' class='btn pri' style='flex:1'>" + ic("bell") + "DEMANDER L'ACCÈS</button></div></form>";
        h += "<p class='gnote'>Mot de passe tiers : expert83 · votre prénom est transmis à l'administrateur pour validation · aucune autre donnée n'est enregistrée.</p></div>";
      }
    }
    return h + "</div>";
  }
  var GATE_MODE = null;
  function gateShow(mode) { GATE_MODE = mode || null; var g = $("#gate"); g.classList.remove("off"); g.innerHTML = gateHTML(GATE_MODE); if (GATE_MODE === "admin") { var p = $("#gatePwd"); if (p) { p.value = ""; setTimeout(function () { p.focus(); }, 80); } } if (GATE_MODE === "tier") { var n = $("#gateName"); if (n) setTimeout(function () { n.focus(); }, 80); var tp = $("#gateTierPwd"); if (tp) tp.value = ""; } }
  function gateHide() { $("#gate").classList.add("off"); }
  function enterAdmin() {
    MODE = "admin"; TIER = null; gateHide(); DB = clone(SEED);
    var raw = STORE.get(KEY);
    if (raw) safe("load", function () { var d = JSON.parse(raw); if (d && d.db && d.db.engines && d.db.engines.length) { DB = d.db; AUDIT = d.audit || []; if (d.prefs) Object.keys(d.prefs).forEach(function (k) { PREF[k] = d.prefs[k]; }); if (d.wp) Object.keys(d.wp).forEach(function (k) { WP.P[k] = d.wp[k]; }); LASTSAVE = d.ts || 0; } }, null);
    FIXES += sanitize(DB); recompute(); WP.apply(); audit("adm", "Session ING-3 ouverte"); saveNow(); runTests(); S.view = "bord"; location.hash = "#/bord"; render();
    toast("ok", "Session administrateur", "Imports, exports et mises à jour massives déverrouillés."); beep("imp");
  }
  function enterTier() { var u = tierUser(); if (!u || u.status !== "granted") { gateShow("tier"); return; } MODE = "tier"; gateHide(); if (!applyTierSnapshot()) { DB = clone(SEED); FIXES += sanitize(DB); } recompute(); WP.apply(); runTests(); S.view = "bord"; location.hash = "#/bord"; render(); toast("info", "Consultation tiers", "Lecture seule — rév. " + (REG.rev || 0) + ". Imports, exports et sauvegarde bloqués."); beep("ok"); }
  function tierSync() { if (!isTier()) return; var u = tierUser(); if (!u || u.status !== "granted") { MODE = null; TIER = null; gateShow("tier"); render(); toast("err", "Accès révoqué", "L'administrateur a retiré cet accès."); return; } if (applyTierSnapshot()) { recompute(); updateMeta(); render(); toast("info", "Base mise à jour", "Révision " + REG.rev + " diffusée par l'administrateur."); } }

  function bind() {
    document.addEventListener("click", function (ev) {
      var el = ev.target.closest ? ev.target.closest("[data-act]") : null;
      if (!el) { if (!(ev.target.closest && ev.target.closest(".omni"))) omniClose(); return; }
      var a = el.dataset.act, id = el.dataset.id;
      if (a === "gateAdmin") { gateShow("admin"); return; }
      if (a === "gateTier") { regLoad(); gateShow("tier"); return; }
      if (a === "gateBack") { gateShow(null); return; }
      if (a === "tierEnter") { enterTier(); return; }
      if (a === "tierCancel") { REG.users = REG.users.filter(function (u) { return u.id !== TIER; }); TIER = null; regSave(); gateShow("tier"); return; }
      if (a === "tierReset") { TIER = null; gateShow("tier"); return; }
      if (a === "omniSeed") { var inp = $("#omni"); if (inp) { inp.value = el.dataset.q; S.omni.q = el.dataset.q; inp.focus(); omniRender(); } return; }
      if (a === "omniHit") { omniActivate(el.dataset.kind, id); return; }
      if (a === "msearch") { var q = prompt("Recherche prédictive (marque, modèle, phase, code, symptôme, rappel, code défaut) :"); if (q) { var i2 = $("#omni"); if (i2) { i2.value = q; S.omni.q = q; omniRender(); i2.focus(); } } return; }
      if (a === "snd") { PREF.sound = !PREF.sound; markDirty(); updateMeta(); if (PREF.sound) beep("ok"); return; }
      if (a === "run") { WP.set("run", !WP.P.run); beep("tick"); return; }
      if (a === "goStudio") { location.hash = "#/studio"; return; }
      if (a === "goAdmin") { if (isAdmin()) location.hash = "#/admin"; else gateShow("admin"); return; }
      if (a === "goDiag") { location.hash = "#/diagnostic"; return; }
      if (a === "goPlan") { location.hash = "#/entretien"; return; }
      if (a === "runTests") { runTests(); location.hash = "#/diagnostic"; render(); return; }
      if (a === "autoFix") { autoFix(); return; }
      if (a === "integrity") { var g = META.integ, h = "<div class='mh'>" + ic("check") + "<h3>Intégrité de la méga-base</h3><button class='tb' data-act='mclose'>" + ic("x") + "</button></div><div class='mb2'><div class='rep' style='max-height:none'><b class='" + (g.ok ? "ok" : "rj") + "'>" + (g.ok ? "BASE INTÈGRE" : "ERREURS") + "</b> — score " + g.pct + "% · " + fmt(META.links) + " liaisons · " + fmt(META.corr) + " corrélations"; if (g.err.length) { h += "<ul>"; g.err.slice(0, 25).forEach(function (e) { h += "<li class='rj'>" + esc(e) + "</li>"; }); h += "</ul>"; } else h += "<p class='ok' style='margin-top:7px'>Aucune référence orpheline, aucun id dupliqué, sévérités normalisées.</p>"; if (FIXES) h += "<p class='wn' style='margin-top:7px'>" + FIXES + " réparation(s) automatique(s) appliquée(s).</p>"; h += "</div></div><div class='mf'><button class='btn pri' data-act='mclose'>Fermer</button></div>"; openModal(h); return; }
      if (a === "undo") { doUndo(); return; }
      if (a === "mclose") { closeModal(); return; }
      if (a === "mscrim") { if (ev.target === el) closeModal(); return; }
      if (a === "drclose") { closeDrawer(); return; }
      if (a === "drback") { var hb = S.drawer.hist.pop(); if (hb) { S.drawer.type = hb.type; S.drawer.id = hb.id; S.drawer.tab = hb.tab; renderDrawer(); } return; }
      if (a === "drtab") { S.drawer.tab = el.dataset.t; renderDrawer(); return; }
      if (a === "openEng") { omniClose(); openDrawer("engine", id, !!S.drawer); return; }
      if (a === "openFault") { omniClose(); openDrawer("fault", id, !!S.drawer); return; }
      if (a === "openTsb") { omniClose(); openDrawer("tsb", id, !!S.drawer); return; }
      if (a === "selEng") { var e = EIDX[id]; if (e) { var m = modelOf(e); S.sel.b = m ? m.b : ""; S.sel.m = m ? m.id : ""; S.sel.e = id; closeDrawer(); location.hash = "#/entretien"; } return; }
      if (a === "expEng") { if (!isAdmin()) { toast("err", "Export refusé", "Réservé à l'administrateur."); return; } var xe = EIDX[id]; if (xe) { download("fiche_" + xe.code.replace(/\W+/g, "_") + ".json", JSON.stringify({ engine: xe, model: modelOf(xe), brand: brandOf(xe), ivi: ivi(xe), faults: faultsFor(xe), tsb: tsbFor(xe), plan: buildPlan(xe, modelOf(xe), brandOf(xe)) }, null, 2)); toast("ok", "Fiche exportée"); beep("ok"); } return; }
      if (a === "ffuel") { var k = el.dataset.k, i = S.f.fuel.indexOf(k); if (i > -1) S.f.fuel.splice(i, 1); else S.f.fuel.push(k); S.shown = 48; render(); beep("tick"); return; }
      if (a === "resetSel") { S.sel = { b: "", m: "", e: "" }; S.f = { q: "", fuel: [], region: "", y: [2017, YMAX], sort: "brand" }; S.shown = 48; render(); return; }
      if (a === "more") { S.shown += 48; render(); return; }
      if (a === "techTab") { S.tech.tab = el.dataset.t; render(); return; }
      if (a === "admTab") { if (!isAdmin()) return; S.adm.tab = el.dataset.t; render(); return; }
      if (a === "expAll") { if (!isAdmin()) { toast("err", "Export refusé", "Réservé à l'administrateur."); return; } download("mecadata_base.json", JSON.stringify(DB, null, 2)); toast("ok", "Base exportée"); beep("ok"); return; }
      if (a === "fileExp") { if (!isAdmin()) { toast("err", "Export refusé", "Réservé à l'administrateur."); return; } download(el.dataset.k + ".json", JSON.stringify(DB[el.dataset.k], null, 2)); beep("ok"); return; }
      if (a === "saveNow") { if (!isAdmin()) return; saveNow(); toast("ok", "Sauvegarde effectuée"); beep("ok"); return; }
      if (a === "publish") { publish(false); render(); return; }
      if (a === "dzPick") { if (!isAdmin()) { toast("err", "Import refusé", "Réservé à l'administrateur."); return; } var f = $("#impFile"); if (f) f.click(); return; }
      if (a === "impAnalyze") { if (!isAdmin()) return; var ta = $("#impText"), t = ta ? ta.value.trim() : "", rep = $("#impReport"); if (!t) { rep.innerHTML = "<div class='rep rj'>Aucune donnée. Déposez un fichier ou collez du contenu.</div>"; beep("err"); return; } try { analyzePayload(sniff("paste.txt", t), "collage"); } catch (e) { rep.innerHTML = "<div class='rep rj'>Analyse impossible : " + esc(String(e)) + "</div>"; beep("err"); } return; }
      if (a === "impApply") { applyImport(); return; }
      if (a === "megaAdd") { megaAdd(+el.dataset.i); return; }
      if (a === "megaAll") { if (!isAdmin()) { toast("err", "Mise à jour refusée", "Réservé à l'administrateur."); return; } var q = S.adm.mega.trim().toLowerCase(); var list = window.MD_RAW.cand.filter(function (c) { return !q || (c.brand + " " + c.model + " " + c.code + " " + c.label + " " + c.note).toLowerCase().indexOf(q) > -1; }); snapshot("méga-base"); list.forEach(function (c) { megaAddSilent(window.MD_RAW.cand.indexOf(c)); }); mutate("mega", "Méga-base : " + list.length + " candidat(s) intégré(s)"); saveNow(); toast("ok", "Méga-base enrichie", list.length + " entrée(s) · " + fmt(META.counts.m) + " modèles · " + fmt(META.counts.e) + " motorisations.", true); beep("imp"); return; }
      if (a === "megaSel") { if (!S.sel.b) { toast("warn", "Aucune marque sélectionnée", "Choisissez une marque dans le module 2."); return; } S.adm.mega = BIDX[S.sel.b] ? BIDX[S.sel.b].n : ""; render(); return; }
      if (a === "accGrant" || a === "accDeny" || a === "accRevoke" || a === "accDel") {
        if (!isAdmin()) return; var u = null; for (var i3 = 0; i3 < REG.users.length; i3++) if (REG.users[i3].id === id) u = REG.users[i3];
        if (a === "accDel") { REG.users = REG.users.filter(function (x) { return x.id !== id; }); regLog("Suppression accès " + (u ? u.name : id)); }
        else if (u) { u.status = a === "accGrant" ? "granted" : (a === "accDeny" ? "denied" : "revoked"); u.at = Date.now(); regLog((a === "accGrant" ? "Accord" : (a === "accDeny" ? "Refus" : "Révocation")) + " — " + u.name); if (a === "accGrant" && !STORE.get(PKEY)) publish(true); }
        regSave(); updateMeta(); render(); beep(a === "accGrant" ? "ok" : "del"); return;
      }
      if (a === "askReset") { if (!isAdmin()) return; confirmModal("Réinitialiser la base ?", "Toutes les modifications et imports sont remplacés par la base usine. Annulation possible 8 s.", "doReset", "Réinitialiser"); return; }
      if (a === "doReset") { closeModal(); snapshot("reset"); DB = clone(SEED); FIXES += sanitize(DB); mutate("del", "Base usine restaurée"); saveNow(); toast("warn", "Base usine restaurée", "", true); return; }
      if (a === "logout") { MODE = null; TIER = null; STORE.sdel("md_adm"); gateShow(null); updateMeta(); toast("info", "Session fermée"); return; }
      if (a === "stMode") { WP.set("mode", el.dataset.m); beep("tick"); return; }
      if (a === "stTheme") { WP.P.useCustom = false; WP.set("theme", el.dataset.t); beep("tick"); return; }
      if (a === "stPreset") { var ps = WP.PRESETS[el.dataset.n]; if (ps) { Object.keys(ps).forEach(function (k) { WP.P[k] = ps[k]; }); WP.apply(); WP.resize(); render(); toast("ok", "Preset appliqué", el.dataset.n); beep("ok"); } return; }
      if (a === "stRandom") { WP.randomize(); render(); toast("ok", "Scène aléatoire", WP.P.mode); beep("imp"); return; }
      if (a === "stReset") { WP.reset(); render(); toast("info", "Réglages réinitialisés"); return; }
      if (a === "stPng") { if (!isAdmin()) { toast("err", "Export refusé", "Export PNG réservé à l'administrateur."); beep("err"); return; } WP.exportPNG(); return; }
      if (a === "stRun") { WP.set("run", !WP.P.run); render(); return; }
      if (a === "stDir") { WP.set("dir", WP.P.dir > 0 ? -1 : 1); render(); return; }
      if (a === "stCustom") { WP.P.useCustom = !!el.checked; WP.drawAll(); markDirty(); WP.sync(); return; }
    });
    document.addEventListener("input", function (ev) {
      var t = ev.target; if (!t) return;
      if (t.id === "omni") { S.omni.q = t.value; omniRender(); return; }
      if (t.dataset && t.dataset.c) { WP.setCustom(t.dataset.c, t.value); return; }
      if (t.dataset && t.dataset.p) { var k = t.dataset.p, v = t.type === "checkbox" ? t.checked : (t.tagName === "SELECT" ? (k === "dir" ? +t.value : t.value) : +t.value); WP.set(k, v); return; }
      if (t.dataset && t.dataset.f) { S.f[t.dataset.f] = t.value; if (t.dataset.f === "region") { S.sel = { b: "", m: "", e: "" }; } S.shown = 48; deb(render, 140)(); return; }
      if (t.dataset && t.dataset.tf) { S.tech[t.dataset.tf] = t.value; if (t.dataset.tf === "region") { S.tech.brand = ""; S.tech.model = ""; } if (t.dataset.tf === "brand") S.tech.model = ""; deb(render, 160)(); return; }
      if (t.dataset && t.dataset.mega) { S.adm.mega = t.value; deb(render, 160)(); return; }
      if (t.dataset && t.dataset.calc) { S.calc[t.dataset.calc] = +t.value || 0; var dl = $("#dueList"), e = selEngine(); if (dl && e) dl.innerHTML = dueHTML(buildPlan(e, modelOf(e), brandOf(e))); return; }
    });
    document.addEventListener("change", function (ev) {
      var t = ev.target; if (!t) return;
      if (t.dataset && t.dataset.sel) { var k = t.dataset.sel; S.sel[k] = t.value; if (k === "b") { S.sel.m = ""; S.sel.e = ""; } if (k === "m") S.sel.e = ""; S.shown = 48; render(); beep("tick"); return; }
      if (t.dataset && t.dataset.calc === "sev") { S.calc.sev = +t.value; var dl = $("#dueList"), e = selEngine(); if (dl && e) dl.innerHTML = dueHTML(buildPlan(e, modelOf(e), brandOf(e))); return; }
      if (t.dataset && t.dataset.act === "liveToggle") { if (!isAdmin()) return; REG.live = !!t.checked; regLog("Diffusion temps réel " + (REG.live ? "activée" : "désactivée")); if (REG.live) publish(true); regSave(); render(); return; }
      if (t.id === "impFile" && t.files && t.files[0]) { if (!isAdmin()) { toast("err", "Import refusé", "Réservé à l'administrateur."); return; } var f = t.files[0], ext = f.name.toLowerCase().split(".").pop(), rd = new FileReader(); if (ext === "xlsx" || ext === "ods" || ext === "zip") { rd.onload = function () { parseOffice(f.name, rd.result); }; rd.readAsArrayBuffer(f); } else { rd.onload = function () { var ta = $("#impText"); if (ta) ta.value = String(rd.result).slice(0, 200000); try { analyzePayload(sniff(f.name, String(rd.result)), f.name); } catch (e) { $("#impReport").innerHTML = "<div class='rep rj'>Fichier non exploitable : " + esc(String(e)) + "<br>Astuce : exportez la feuille en CSV ou JSON.</div>"; beep("err"); } }; rd.readAsText(f); } return; }
    });
    document.addEventListener("submit", function (ev) {
      var form = ev.target.closest ? ev.target.closest("[data-form]") : null; if (!form) return; ev.preventDefault();
      var fd = new FormData(form);
      if (form.dataset.form === "admin") { var p = $("#gatePwd"); if (p) p.value = ""; if (fd.get("pwd") === PWD) enterAdmin(); else { toast("err", "Mot de passe incorrect"); beep("err"); gateShow("admin"); } return; }
      if (form.dataset.form === "tier") {
        var name = String(fd.get("name") || "").trim().slice(0, 24), tp = String(fd.get("tpwd") || "");
        var tpf = $("#gateTierPwd"); if (tpf) tpf.value = "";
        if (name.length < 2) { toast("err", "Prénom requis", "Saisissez au moins 2 caractères."); beep("err"); return; }
        if (tp !== TPWD) { toast("err", "Mot de passe tiers incorrect", "Le mot de passe tiers est requis pour demander l'accès."); beep("err"); gateShow("tier"); return; }
        regLoad(); var ex = null; REG.users.forEach(function (u) { if (nk(u.name) === nk(name)) ex = u; });
        if (ex) { TIER = ex.id; if (ex.status === "granted") { enterTier(); return; } if (ex.status === "pending") { gateShow("tier"); return; } ex.status = "pending"; ex.ts = Date.now(); ex.at = null; }
        else { var u2 = { id: uid("U"), name: name, status: "pending", ts: Date.now(), at: null }; REG.users.push(u2); TIER = u2.id; }
        regLog("Demande d'accès — " + name); regSave(); gateShow("tier"); toast("info", "Demande envoyée", "L'administrateur a été notifié."); beep("imp"); return;
      }
    });
    document.addEventListener("dragover", function (ev) { var dz = ev.target.closest ? ev.target.closest("#dz") : null; if (dz && isAdmin()) { ev.preventDefault(); dz.classList.add("over"); } });
    document.addEventListener("dragleave", function (ev) { var dz = ev.target.closest ? ev.target.closest("#dz") : null; if (dz) dz.classList.remove("over"); });
    document.addEventListener("drop", function (ev) { var dz = ev.target.closest ? ev.target.closest("#dz") : null; if (!dz) return; ev.preventDefault(); dz.classList.remove("over"); if (!isAdmin()) { toast("err", "Import refusé", "Réservé à l'administrateur."); return; } var f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]; if (!f) return; var ext = f.name.toLowerCase().split(".").pop(), rd = new FileReader(); if (ext === "xlsx" || ext === "ods" || ext === "zip") { rd.onload = function () { parseOffice(f.name, rd.result); }; rd.readAsArrayBuffer(f); } else { rd.onload = function () { var ta = $("#impText"); if (ta) ta.value = String(rd.result).slice(0, 200000); try { analyzePayload(sniff(f.name, String(rd.result)), f.name); } catch (e) { $("#impReport").innerHTML = "<div class='rep rj'>Fichier non exploitable : " + esc(String(e)) + "</div>"; } }; rd.readAsText(f); } });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") { if (modalOpenFn()) closeModal(); else if (S.drawer) closeDrawer(); else omniClose(); return; }
      if (ev.key === "/" && !/input|textarea|select/i.test(ev.target.tagName)) { var o = $("#omni"); if (o && MODE) { ev.preventDefault(); o.focus(); } return; }
      if (ev.target && ev.target.id === "omni") { if (ev.key === "ArrowDown") { ev.preventDefault(); omniMove(1); } else if (ev.key === "ArrowUp") { ev.preventDefault(); omniMove(-1); } else if (ev.key === "Enter") { ev.preventDefault(); var box = $("#omnires"), els = box ? $$(".hit", box) : [], p = els[S.omni.idx] || els[0]; if (p) omniActivate(p.dataset.kind, p.dataset.id); } }
      if ((ev.key === "Enter" || ev.key === " ") && ev.target.classList && ev.target.classList.contains("eng")) { ev.preventDefault(); ev.target.click(); }
    });
    window.addEventListener("hashchange", function () { if (!MODE) return; route(); beep("tick"); });
    window.addEventListener("storage", function (ev) { if (ev.key === AKEY) { regLoad(); if (isTier()) tierSync(); else if (isAdmin()) { updateMeta(); if (S.view === "admin") render(); } else if (GATE_MODE === "tier") gateShow("tier"); } if (ev.key === PKEY && isTier()) tierSync(); });
    window.addEventListener("pagehide", function () { if (isAdmin()) saveNow(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden && isAdmin()) saveNow(); });
    setInterval(function () { var c = $("#clk"); if (c) c.textContent = new Date().toLocaleTimeString("fr-FR"); }, 1000);
    setInterval(function () { if (isAdmin() && DIRTY) saveNow(); }, 20000);
    setInterval(function () { if (!CH) { regLoad(); if (isTier()) tierSync(); else if (isAdmin()) updateMeta(); else if (GATE_MODE === "tier") gateShow("tier"); } }, 2000);
    setInterval(function () { if (isAdmin()) { var pc = pendingCount(); if (pc > PENDING) { PENDING = pc; toast("warn", "Nouvelle demande d'accès", pc + " demande(s) en attente de validation."); beep("imp"); updateMeta(); if (S.view === "admin") render(); } else PENDING = pc; } }, 1500);
  }
  function parseOffice(name, buf) {
    if (!isAdmin()) { toast("err", "Import refusé", "Réservé à l'administrateur."); return; }
    var rep = $("#impReport");
    if (typeof DecompressionStream === "undefined") { rep.innerHTML = "<div class='rep rj'>Classeur Office : décompression non disponible dans ce WebView. Exportez la feuille en CSV ou JSON puis réimportez.</div>"; beep("err"); return; }
    rep.innerHTML = "<div class='rep'>Lecture du classeur " + esc(name) + "…</div>";
    var u8 = new Uint8Array(buf), dv = new DataView(buf), eocd = -1, i;
    for (i = u8.length - 22; i >= 0 && i > u8.length - 66000; i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) { rep.innerHTML = "<div class='rep rj'>Archive ZIP invalide.</div>"; beep("err"); return; }
    var n = dv.getUint16(eocd + 10, true), off = dv.getUint32(eocd + 16, true), entries = {}, dec = new TextDecoder("utf-8");
    for (var e = 0; e < n; e++) { if (dv.getUint32(off, true) !== 0x02014b50) break; var method = dv.getUint16(off + 10, true), csize = dv.getUint32(off + 20, true), nl = dv.getUint16(off + 28, true), el = dv.getUint16(off + 30, true), cl = dv.getUint16(off + 32, true), lho = dv.getUint32(off + 42, true); var nm = dec.decode(u8.subarray(off + 46, off + 46 + nl)), lnl = dv.getUint16(lho + 26, true), lel = dv.getUint16(lho + 28, true), ds = lho + 30 + lnl + lel; var comp = u8.subarray(ds, ds + csize); entries[nm] = method === 0 ? Promise.resolve(comp) : inflate(comp); off += 46 + nl + el + cl; }
    Promise.all(Object.keys(entries).map(function (k) { return entries[k].then(function (d) { return [k, d]; }); })).then(function (list) {
      var map = {}; list.forEach(function (p) { map[p[0]] = p[1]; });
      var isOds = !!map["content.xml"];
      var rows = isOds ? odsRows(dec.decode(map["content.xml"])) : xlsxRows(map, dec);
      if (!rows.length) throw "aucune ligne exploitable";
      var head = rows[0].map(function (x) { return String(x || "").trim(); }), recs = [];
      for (var r = 1; r < rows.length; r++) { var o = {}, empty = true; for (var c2 = 0; c2 < head.length; c2++) { var v = rows[r][c2] === undefined ? "" : rows[r][c2]; if (String(v).trim() !== "") empty = false; o[head[c2]] = v; } if (!empty) recs.push(o); }
      analyzePayload({ fmt: isOds ? "ODS" : "XLSX", records: recs }, name);
    }).catch(function (err) { rep.innerHTML = "<div class='rep rj'>Classeur non exploitable : " + esc(String(err)) + "<br>Astuce : exportez en CSV ou JSON.</div>"; beep("err"); });
  }
  function inflate(comp) { return new Response(new Blob([comp]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer().then(function (b) { return new Uint8Array(b); }); }
  function colIdx(ref) { var m = String(ref || "").match(/^([A-Z]+)/); if (!m) return 0; var s = m[1], n = 0; for (var i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64); return n - 1; }
  function xlsxRows(map, dec) { var shared = []; var sk = Object.keys(map).filter(function (k) { return /sharedStrings\.xml$/.test(k); })[0]; if (sk) { var sd = new DOMParser().parseFromString(dec.decode(map[sk]), "application/xml"), sis = sd.getElementsByTagName("si"); for (var i = 0; i < sis.length; i++) { var ts = sis[i].getElementsByTagName("t"), s = ""; for (var j = 0; j < ts.length; j++) s += ts[j].textContent; shared.push(s); } } var sheet = Object.keys(map).filter(function (k) { return /xl\/worksheets\/sheet1\.xml$/.test(k); })[0] || Object.keys(map).filter(function (k) { return /xl\/worksheets\/.*\.xml$/.test(k); })[0]; if (!sheet) throw "feuille introuvable"; var doc = new DOMParser().parseFromString(dec.decode(map[sheet]), "application/xml"), rows = doc.getElementsByTagName("row"), grid = []; for (var r = 0; r < rows.length; r++) { var cs = rows[r].getElementsByTagName("c"), arr = []; for (var c = 0; c < cs.length; c++) { var cell = cs[c], idx = colIdx(cell.getAttribute("r")), ty = cell.getAttribute("t"), val = ""; if (ty === "inlineStr") { var it = cell.getElementsByTagName("t"); for (var k = 0; k < it.length; k++) val += it[k].textContent; } else { var ve = cell.getElementsByTagName("v")[0], raw = ve ? ve.textContent : ""; val = ty === "s" ? (shared[+raw] || "") : raw; } arr[idx] = val; } grid.push(arr); } return grid; }
  function odsRows(xml) { var doc = new DOMParser().parseFromString(xml, "application/xml"), tbs = doc.getElementsByTagName("table:table"); if (!tbs.length) throw "tableau introuvable"; var rows = tbs[0].getElementsByTagName("table:table-row"), grid = []; for (var r = 0; r < rows.length; r++) { var cs = rows[r].getElementsByTagName("table:table-cell"), arr = []; for (var c = 0; c < cs.length; c++) { var ps = cs[c].getElementsByTagName("text:p"), s = ""; for (var p = 0; p < ps.length; p++) s += ps[p].textContent; var rep = Math.min(+(cs[c].getAttribute("table:number-columns-repeated") || 1), 64); for (var q = 0; q < rep; q++) arr.push(s); } grid.push(arr); } return grid; }
  function route() { var h = (location.hash || "#/bord").replace("#/", ""); var allowed = isTier() ? ["bord", "explorer", "tech", "entretien", "studio", "diagnostic"] : ["bord", "explorer", "tech", "entretien", "studio", "admin", "diagnostic"]; S.view = allowed.indexOf(h) > -1 ? h : "bord"; render(); }
  function boot() { var o = $("#boot"), done = function () { if (!o) return; o.className = "off"; }; var L = [["Noyau MECADATA v8.1", 12], ["Méga-base 2017→2027 toutes régions", 34], [DB.brands.length + " marques · " + DB.models.length + " modèles", 58], [fmt(DB.engines.length) + " motorisations", 78], [DB.faults.length + " pannes · " + DB.tsb.length + " TSB/rappels", 92], ["Portail d'accès prêt", 100]]; var lg = $("#bl"), i = 0, step = function () { if (i >= L.length) { setTimeout(done, 260); return; } var x = L[i++], d = document.createElement("div"); d.innerHTML = "<b>OK</b> " + esc(x[0]); lg.appendChild(d); while (lg.children.length > 5) lg.removeChild(lg.firstChild); $("#bbar").style.width = x[1] + "%"; setTimeout(step, 110); }; setTimeout(step, 120); setTimeout(done, 2600); }
  function init() {
    if (!window.MD_RAW) { logErr("init", new Error("MD_RAW absent")); window.__MD_READY = false; return; }
    SEED = build(window.MD_RAW); FIXES += sanitize(SEED); DB = clone(SEED);
    regLoad(); recompute();
    try { if (window.BroadcastChannel) { CH = new BroadcastChannel("mecadata_v81"); CH.onmessage = function (ev) { var m = ev.data || {}; if (m.t === "reg") { regLoad(); if (isTier()) tierSync(); else if (isAdmin()) { updateMeta(); if (S.view === "admin") render(); } else if (GATE_MODE === "tier") gateShow("tier"); } if (m.t === "pub" && isTier()) tierSync(); }; } } catch (e) {}
    WP.init(); bind(); runTests(); updateMeta(); boot(); gateShow(null);
    window.__MD_READY = true; window.__MD_SCRIPTS.app = true;
    var jf = $("#jsfail"); if (jf && jf.parentNode) jf.parentNode.removeChild(jf);
  }
  try { init(); } catch (e) { logErr("init", e); if (window.__MD_LIFT) window.__MD_LIFT(); var v = $("#view"); if (v) v.innerHTML = "<div class='card panel'><h3 style='color:#FF4D5E'>Erreur d'initialisation</h3><p class='muted'>" + esc(e.message) + "</p><button class='btn pri' onclick='location.reload()'>Recharger</button></div>"; window.__MD_READY = false; }
})();
