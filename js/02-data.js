/* 02-data.js — jeu de données externe. Forme EXACTE exigée par 04-app.build().
   segs: dict clé->libellé | br: [id,nom,pays,groupe] | md: {brandId:[[nom,y0,y1,segKey,phase]]}
   me: {modelId:[[code,fam,libelle,fuel,disp,hp,nm,gb,y0,y1]]}
   ft: [t,fam,mt,ph,sev,freq,y0,y1,km0,km1,sym,cause,fix,c0,c1,status,dom]
   ts: [ref,b,fam,mt,ph,titre,date,cat,sev,resume,action,dom]
   svc: {fams:[...],fuel,base,months,oil:[lbl,L],dist:[lbl,km,mois],items:[[lbl,kmInt,moisInt]],controls:[...],fluids:[7]}
   cand: {type,brand,model,phase,code,label,hp,nm,disp,fuel,gb,y0,y1,seg,note}
   Si ce fichier est absent/corrompu, 04-app bascule sur son jeu de secours interne. */
(function(){
"use strict";
window.MD_RAW={
  segs:{"C":"Compacte","B":"Berline","S":"SUV","R":"Routeur","U":"Utilitaire","M":"Multisegment","H":"Hatchback"},
  br:[
    ["peugeot","Peugeot","France","Stellantis"],["citroen","Citroën","France","Stellantis"],["renault","Renault","France","Renault"],
    ["volkswagen","Volkswagen","Allemagne","VW"],["audi","Audi","Allemagne","VW"],["bmw","BMW","Allemagne","BMW"],
    ["mercedes","Mercedes-Benz","Allemagne","Mercedes"],["hyundai","Hyundai","Corée","Hyundai-Kia"],["kia","Kia","Corée","Hyundai-Kia"],
    ["toyota","Toyota","Japon","Toyota"],["nissan","Nissan","Japon","Renault-Nissan-Mitsubishi"],["ford","Ford","États-Unis","Ford"],
    ["opel","Opel","Allemagne","Stellantis"],["seat","Seat","Espagne","VW"],["skoda","Škoda","Tchéquie","VW"],
    ["dacia","Dacia","Roumanie","Renault"],["tesla","Tesla","États-Unis","Tesla"],["volvo","Volvo","Suède","Geely"],
    ["mazda","Mazda","Japon","Mazda"],["fiat","Fiat","Italie","Stellantis"]
  ],
  md:{
    peugeot:[["208 III",2019,2027,"H",1],["308 III",2021,2027,"C",1],["3008 II Phase 1",2016,2020,"S",1],["3008 II Phase 2",2020,2027,"S",2],["508 II",2018,2027,"B",1]],
    citroen:[["C3 IV",2020,2027,"B",1],["C4 III",2020,2027,"C",1],["C5 Aircross",2018,2027,"S",1]],
    renault:[["Clio V",2019,2027,"H",1],["Captur II",2020,2027,"S",1],["Megane IV",2016,2027,"C",1],["Austral",2022,2027,"S",1]],
    volkswagen:[["Golf VIII",2019,2027,"H",1],["Tiguan II",2016,2027,"S",1],["ID.4",2021,2027,"S",1]],
    audi:[["A3 IV",2020,2027,"C",1],["Q3 II",2018,2027,"S",1]],
    bmw:[["Serie 1 F40",2019,2027,"H",1],["X1 U",2022,2027,"S",1]],
    mercedes:[["Classe A W177",2018,2027,"H",1],["GLC X254",2022,2027,"S",1]],
    hyundai:[["Tucson IV",2020,2027,"S",1],["Ioniq 5",2021,2027,"S",1]],
    kia:[["Sportage V",2021,2027,"S",1],["EV6",2021,2027,"S",1]],
    toyota:[["Yaris III",2020,2027,"H",1],["RAV4 V",2018,2027,"S",1],["Corolla XII",2019,2027,"C",1]],
    nissan:[["Qashqai III",2021,2027,"S",1]],
    ford:[["Focus IV",2018,2027,"C",1],["Kuga III",2020,2027,"S",1]],
    opel:[["Corsa F",2019,2027,"H",1],["Astra L",2021,2027,"C",1]],
    seat:[["Leon IV",2020,2027,"C",1]],
    skoda:[["Octavia IV",2020,2027,"B",1]],
    dacia:[["Duster II",2024,2027,"S",1],["Spring",2024,2027,"S",1]],
    tesla:[["Model 3",2017,2027,"B",1],["Model Y",2020,2027,"S",1]],
    volvo:[["XC40 Recharge",2021,2027,"S",1]],
    mazda:[["CX-5 II",2022,2027,"S",1]],
    fiat:[["500e",2020,2027,"H",1]]
  },
  me:{
    "peugeot-208-iii":[["EB2ADTX","EB2","1.2 PureTech 130 EAT8","e",1199,130,230,"EAT8",2020,2027]],
    "peugeot-308-iii":[["EP6CDTX","EP6","1.5 BlueHDi 130 EAT8","d",1499,130,300,"EAT8",2021,2027],["EB2ADTM","EB2","1.2 PureTech 100 BVM","e",1199,100,205,"BVM",2021,2027]],
    "peugeot-3008-ii-phase-1":[["DV5RUCd","DV5","1.5 BlueHDi 130 S&S BVM","d",1499,130,300,"BVM",2016,2020]],
    "peugeot-3008-ii-phase-2":[["DV5RUCe","DV5","1.5 BlueHDi 130 EAT8","d",1499,130,300,"EAT8",2020,2024],["EP6DTDA","EP6","1.6 THP 180 EAT8","e",1598,180,250,"EAT8",2020,2023],["EM4","EM4","e-3008 136 kW","b",0,185,260,"BVM",2023,2027]],
    "peugeot-508-ii":[["DV5RD","DV5","2.0 BlueHDi 160 EAT8","d",1997,160,400,"EAT8",2018,2023]],
    "citroen-c4-iii":[["DV5RUCd","DV5","1.5 BlueHDi 130 BVM","d",1499,130,300,"BVM",2020,2027]],
    "renault-clio-v":[["H5Dt","H5Dt","1.3 TCe 100 X-tronic","e",1333,100,200,"CVT",2019,2027],["K9K806","K9K","1.5 Blue dCi 100","d",1461,100,260,"BVM",2019,2027]],
    "renault-captur-ii":[["HR12DD","HR12","1.3 TCe 150 EDC","e",1333,150,270,"EDC",2020,2027]],
    "renault-megane-iv":[["R9M01","R9M","1.3 TCe 140 X-tronic","e",1333,140,240,"CVT",2016,2022]],
    "renault-austral":[["P5Di","P5Di","1.2 E-Tech Hybrid 160","p",1199,160,205,"EDC",2022,2027]],
    "volkswagen-golf-viii":[["EA211-DPCA","EA211","1.5 TSI ACT 130 DSG","e",1498,130,250,"DSG",2020,2027],["EA288-DSTA","EA288","2.0 TDI 116 DSG","d",1968,116,300,"DSG",2020,2027]],
    "volkswagen-tiguan-ii":[["EA888-DKRB","EA888","2.0 TSI 190 4Motion DSG","e",1984,190,320,"DSG",2016,2023]],
    "volkswagen-id-4":[["ID4-AIM","ID4","ID.4 Pro 170 kW","b",0,231,310,"BVM",2021,2027]],
    "audi-a3-iv":[["EA211-DPCA","EA211","1.5 TFSI 150 S tronic","e",1498,150,250,"DSG",2020,2027]],
    "audi-q3-ii":[["EA288-DSUA","EA288","2.0 TDI 150 quattro S tronic","d",1968,150,340,"DSG",2018,2027]],
    "bmw-serie-1-f40":[["B48A20","B48","118i 140 Steptronic","e",1998,140,220,"BVA",2019,2027]],
    "bmw-x1-u":[["B47A20","B47","sDrive18d Steptronic","d",1995,150,360,"BVA",2022,2027]],
    "mercedes-classe-a-w177":[["OM282","OM282","A 200 8G-DCT","d",1991,190,400,"BVA",2018,2027]],
    "mercedes-glc-x254":[["OM654","OM654","GLC 300 d 4MATIC","d",1993,245,500,"BVA",2022,2027]],
    "hyundai-tucson-iv":[["Smartstream-G1.6T","G1.6T","1.6 TGDi 48V DCT","e",1598,150,265,"DSG",2020,2027]],
    "hyundai-ioniq-5":[["E-GMP63","E-GMP","Ioniq 5 63 kWh RWD","b",0,170,350,"BVM",2021,2027]],
    "kia-sportage-v":[["Smartstream-D1.6","D1.6T","1.6 CRDi 48V DCT","d",1598,136,320,"DSG",2021,2027]],
    "kia-ev6":[["E-GMP77","E-GMP","EV6 GT-Line 77 kWh AWD","b",0,325,600,"BVM",2021,2027]],
    "toyota-yaris-iii":[["M20A-FXS","M20A","1.5 Hybrid 116 e-CVT","h",1490,116,120,"CVT",2020,2027]],
    "toyota-rav4-v":[["A25A-FXS","A25A","2.5 Hybrid 218 e-CVT AWD-i","h",2487,218,227,"CVT",2018,2027]],
    "toyota-corolla-xii":[["1ZZ-FE","1ZZ","1.8 Hybrid 122 e-CVT","h",1798,122,142,"CVT",2019,2027]],
    "nissan-qashqai-iii":[["KR15DDT","KR15","1.3 DIG-T 158 X-tronic","e",1332,158,270,"CVT",2021,2027]],
    "ford-focus-iv":[["EcoBoost-1.0","EB10","1.0 EcoBoost 125 BVM","e",999,125,210,"BVM",2018,2027]],
    "ford-kuga-iii":[["EcoBlue-1.5","EB15","1.5 EcoBlue 120 BVM","d",1499,120,300,"BVM",2020,2027]],
    "opel-corsa-f":[["EB2ADTX","EB2","1.2 Turbo 130 BVM","e",1199,130,230,"BVM",2019,2027]],
    "opel-astra-l":[["DV5RUCd","DV5","1.5 Diesel 130 BVM","d",1499,130,300,"BVM",2021,2027]],
    "seat-leon-iv":[["EA211-DPCA","EA211","1.5 TSI 130 DSG","e",1498,130,250,"DSG",2020,2027]],
    "skoda-octavia-iv":[["EA288-DSTA","EA288","2.0 TDI 116 DSG","d",1968,116,300,"DSG",2020,2027]],
    "dacia-duster-ii":[["H5Ht","H5Ht","1.2 TCe 130 CVT","e",1198,130,205,"CVT",2024,2027]],
    "dacia-spring":[["Dacia-REV","DREV","Spring 52 kW","b",0,70,113,"BVM",2024,2027]],
    "tesla-model-3":[["Tesla-M3","TM3","Model 3 Long Range AWD","b",0,412,493,"BVM",2017,2027]],
    "tesla-model-y":[["Tesla-MY","TMY","Model Y Performance","b",0,462,527,"BVM",2020,2027]],
    "volvo-xc40-recharge":[["Volvo-P6","VP6","XC40 Recharge Twin","b",0,408,460,"BVM",2021,2027]],
    "mazda-cx5-ii":[["Skyactiv-G2.0","SG20","2.0 e-Skyactiv G 165","e",1998,165,213,"BVM",2022,2027]],
    "fiat-500e":[["Fiat-BEV","FBEV","500e 42 kWh","b",0,118,220,"BVM",2020,2027]]
  },
  ft:[
    ["Courroie de distribution qui se dégrade prématurément (EB2 PureTech)","EB2","208,308,3008,Corsa","*","critique","élevée",2017,2024,20000,120000,"Râle froid|Fuite d'huile carter|Vibrations|Voyant pression huile","La courroie immergée dans l'huile se gorgerait et des particules obstruent la crépine de pompe à huile.","Remplacement courroie + galets + crépine + vidange conforme norme; contrôle pompe à huile.",600,1400,"Campagne / surveillance","Distribution"],
    ["Chaîne de distribution détendue (DV5 BlueHDi)","DV5","3008,308,C4,Astra","*","majeure","moyenne",2017,2026,60000,180000,"Claquement à froid|Râle métallique|Perte de puissance|Voyant moteur","Étirements de chaîne et guides usés sur motorisations diesel parcourues.","Contrôle tension chaîne; remplacement chaîne + guides si jeu > seuil constructeur.",900,2200,"Surveillance","Distribution"],
    ["Système AdBlue / SCR encrassé (NOx)","DV5,K9R,R9M,EA288","3008,Clio,Megane,Golf,Tiguan","*","majeure","élevée",2018,2027,30000,160000,"Voyant AdBlue|Limitation de couple|Défaut NOx|Démarrage interdit après compteur","Cristallisation de l'urée dans la ligne et le injecteur; capteur NOx défaillant.","Nettoyage/ remplacement injecteur AdBlue, capteurs NOx, cuve et pompe; recyclage calculateur.",400,1800,"Surveillance","Dépollution"],
    ["Vanne EGR encrassée / bloquée ouverte","DV5,EA288,EP6,K9K,HR12","3008,Golf,Clio,508,Tucson","*","modérée","élevée",2016,2027,40000,160000,"À-coups ralenti|Fumée noire|Défaut suralimentation|Perte de puissance","Encrassement par les suies en usage urbain; carte EGR inadaptée.","Nettoyage ou remplacement vanne EGR + admission; mise à jour cartographie.",250,900,"Surveillance","Dépollution"],
    ["FAP / DPF colmaté (régénérations incomplètes)","DV5,EA288,DKRB,OM654","3008,Tiguan,GLC,508","*","modérée","moyenne",2016,2027,60000,200000,"Voyant FAP|Consommation huile en hausse|Mode dégradé|Régénération interrompue","Usage urbain court-circuitant la régénération; capteur différentiel de pression HS.","Régénération forcée; remplacement capteur ΔP ou FAP si saturation.",300,2500,"Surveillance","Dépollution"],
    ["Turbo géométrie variable grippée","DV5,DKRB,B47,OM654","3008,Tiguan,X1,GLC","*","majeure","moyenne",2017,2026,70000,200000,"Sifflement|Perte de puissance à mi-régime|Fumée|Voyant suralimentation","Cartographie et huile encrassent les ailettes VNT; jeu axe turbo.","Remplacement turbo + adaptation; contrôle durites et intercooler.",700,2400,"Surveillance","Suralimentation"],
    ["Boîte EAT8 / Aisin : à-coups et patinage à froid","EP6,EB2,DV5","3008,308,508","*","modérée","moyenne",2018,2027,30000,150000,"À-coups 1-2|Vibrations|Patinage|Voyant transmission","Convertisseur de couple et valve body sensibles à l'huile vieillie.","Vidange boîte + adaptation; reprogrammation TCU; vérification mécatronique.",400,1600,"Surveillance","Transmission"],
    ["DSG / DQ200 : embrayage et mécatronique","EA211,EA888","Golf,A3,Leon,Octavia","*","majeure","élevée",2017,2027,40000,160000,"Tressautements|Patinage|Passages hachés|Voyant boîte","Usure embrayage sec et défaillance bloc mécatronique.","Remplacement kit embrayage + mécatronique; adaptation.",900,2600,"Surveillance","Transmission"],
    ["ICCU / onduleur défaillant (Ioniq 5 / EV6)","E-GMP","Ioniq 5,EV6","*","critique","moyenne",2021,2026,10000,120000,"Perte de traction|Voyant 12V|Non-démarrage|Erreur isolation","Surcharge thermique de l'Integrated Charging Control Unit.","Remplacement ICCU sous garantie étendue; contrôle fusibles et batterie 12V.",0,0,"Campagne constructeur","Électrification"],
    ["Pompe à vide de freinage défaillante (diesel/essence)","DV5,EB2,EA211","3008,208,Golf","*","majeure","faible",2017,2026,60000,180000,"Pédale dure|Assistance freinage réduite|Voyant frein","Membrane de pompe à vide percée; dépression insuffisante.","Remplacement pompe à vide + contrôle réservoir dépression.",200,700,"Surveillance","Freinage"],
    ["BSI / calculateur multimédia figé (écran noir)","EM4,EP6,DV5","3008,e-208,208","*","modérée","moyenne",2019,2027,10000,120000,"Écran noir|Redémarrages parasites|Perte fonctions confort","Micro-coupure d'alimentation ou corruption firmware BSI.","Reflash BSI; remplacement si matériel; contrôle masse et alimentation.",150,900,"Surveillance","Électronique"],
    ["Batterie 12V / réseau électrique (hybrides & EV)","E-GMP,ID4,TM3,EM4","Ioniq 5,ID.4,Model 3,e-3008","*","mineure","élevée",2020,2027,5000,120000,"Non-démarrage|Voyants multiples|Portes inertes","Batterie 12V de service défaillante; DC-DC mal régulé.","Remplacement batterie 12V; contrôle convertisseur DC-DC.",80,400,"Surveillance","Électrification"],
    ["Injecteurs essence : ratés et consommation (EP6/EA211)","EP6,EA211,B48","3008,Golf,Serie 1","*","modérée","moyenne",2017,2027,40000,160000,"Ratés à chaud|Consommation|À-coups|Voyant moteur","Encrassement direct; pression rampe instable.","Nettoyage/remplacement injecteurs; contrôle rampe et pompe HP.",300,1200,"Surveillance","Alimentation"],
    ["Volant moteur bi-masse fissuré (diesel)","DV5,EA288,OM654","3008,Golf,GLC","*","majeure","moyenne",2016,2026,80000,200000,"Vibrations ralenti|Claquement démarrage|Râle","Fatigue des ressorts de amortissement du DMF.","Remplacement volant moteur bi-masse + embrayage si besoin.",800,1900,"Surveillance","Transmission"],
    ["Suspension / rotules et silentblocs avant usés","*","3008,Tucson,Sportage,RAV4","*","mineure","élevée",2016,2027,40000,180000,"Claquement sur dos d'âne|Direction imprécise|Usure pneus inner","Sollicitation routes dégradées; geometry sensible.","Remplacement rotules + silentblocs + parallélisme.",150,600,"Surveillance","Chassis"]
  ],
  ts:[
    ["RPL-PEU-2023-EB2","peugeot","EB2","208,308,3008","*","Rappel courroie distribution immergée","2023-09","Rappel","critique","Campagne constructeur sur les EB2 produits 2017-2023 : risque de dégradation prématurée de la courroie et obstruction de la crépine de pompe à huile.","Contrôle et remplacement courroie + galets + crépine + vidange conforme; gratuit, sur convocation.","Distribution"],
    ["RPL-CIT-2024-DV5","citroen,peugeot","DV5","C4,3008","2","Rappel chaîne de distribution DV5 phase 2","2024-03","Rappel","majeure","Surveillance renforcée de la chaîne sur DV5 phase 2 : risque de détente et claquement à froid.","Contrôle jeu chaîne; remplacement chaîne + guides si hors tolrance.","Distribution"],
    ["RPL-HYU-2022-ICCU","hyundai,kia","E-GMP","Ioniq 5,EV6","*","Rappel ICCU / onduleur","2022-11","Rappel","critique","Défaillance de l'Integrated Charging Control Unit pouvant entraîner perte de traction et non-démarrage.","Remplacement ICCU sous extension de garantie; contrôle batterie 12V.","Électrification"],
    ["TSB-VW-2021-DSG","volkswagen,audi,seat,skoda","EA211,EA888","Golf,A3,Leon,Octavia","*","TSB à-coups DQ200 à froid","2021-06","TSB","modérée","Tressautements 1-2 sur DSG à sec; adaptation et logiciel TCU mis à jour.","Mise à jour TCU; contrôle embrayage; remplacement mécatronique si défaut confirmé.","Transmission"],
    ["TSB-RNO-2020-ADBLUE","renault","K9K,R9M,HR12","Clio,Captur,Megane","*","TSB cristallisation AdBlue","2020-10","TSB","majeure","Cristallisation urée sur lignes SCR; défaut NOx et limitation de couple.","Nettoyage ligne et injecteur; remplacement capteurs NOx si nécessaire.","Dépollution"],
    ["TSB-BMW-2022-GPF","bmw","B48,B47","Serie 1,X1","*","TSB surchauffe GPF essence","2022-04","TSB","modérée","Régénérations GPF trop fréquentes en urbain; risque surchauffe catalyseur.","Mise à jour cartographie; contrôle température GPF.","Dépollution"],
    ["TSB-TSL-2023-12V","tesla","TM3,TMY","Model 3,Model Y","*","TSB batterie 12V et DC-DC","2023-02","TSB","mineure","Voyants multiples et portes inertes liés à la batterie 12V de service.","Remplacement batterie 12V; contrôle convertisseur DC-DC.","Électrification"],
    ["TSB-FOR-2021-EcoBoost","ford","EB10","Focus","*","TSB refroidissement 1.0 EcoBoost","2021-08","TSB","majeure","Risque de surchauffe et fissure culasse sur 1.0 EB early; contrôle joints et thermostat.","Remplacement thermostat; contrôle culasse; mise à jour logiciel.","Refroidissement"],
    ["TSB-TOY-2022-HSD","toyota","M20A,A25A","Yaris,RAV4,Corolla","*","TSB hybride : pompe à eau électrique","2022-05","TSB","modérée","Bruит et défaut pompe à eau électrique sur chaînes hybrides.","Remplacement pompe à eau électrique; contrôle coolant.","Refroidissement"],
    ["RPL-MER-2024-OM654","mercedes","OM654","GLC,Classe A","*","Rappel injection diesel OM654","2024-01","Rappel","majeure","Injecteurs piézo sensibles; risque fumée et défaut NOx.","Remplacement injecteurs; reprogrammation; contrôle rampe.","Alimentation"]
  ],
  svc:[
    {fams:["EB2","EP6","DV5","K9K","R9M","HR12","EA211","EA288","B48","B47","OM282","OM654","G1.6T","D1.6T","KR15","EB10","EB15","SG20","H5Ht","H5Dt"],fuel:"d",base:20000,months:12,
     oil:["0W-30 C2/C3 ACEA",5],dist:["Courroie/chaîne distribution",0,0],
     items:[["Filtre à huile + huile moteur",20000,0],["Filtre à air",40000,0],["Filtre habitacle",20000,0],["Filtre à carburant",60000,0],["Bougies de préchauffage",0,60],["Huile de boîte",80000,0],["Liquide de freins",0,24],["Liquide de refroidissement",0,60],["Courroie accessoires",120000,0],["Batterie 12V",0,48]],
     controls:["Contrôle plaquettes et disques","Contrôle suspension et rotules","Contrôle géométrie et parallélisme","Diagnostic calculateurs et voyants","Contrôle éclairage et avertisseurs","Contrôle niveaux et fuites"],
     fluids:["24 mois","5 ans / 200 000 km",120,2.5,2.3,"Recyclage 24 mois","Contrôle 12 mois"]},
    {fams:["EB2","EP6","EA211","EA888","B48","KR15","EB10","SG20","H5Ht","H5Dt","DKRB"],fuel:"e",base:15000,months:12,
     oil:["0W-30 / 5W-30 ACEA C2",4.5],dist:["Courroie distribution",120000,10],
     items:[["Filtre à huile + huile moteur",15000,0],["Filtre à air",30000,0],["Filtre habitacle",15000,0],["Bougies d'allumage",60000,0],["Courroie accessoires",120000,0],["Liquide de freins",0,24],["Liquide de refroidissement",0,60],["Huile de boîte",80000,0],["Batterie 12V",0,48]],
     controls:["Contrôle plaquettes et disques","Contrôle turbo et durites","Contrôle injection et ratés","Diagnosticcalculateurs","Contrôle échappement et FAP/GPF","Contrôle niveaux et fuites"],
     fluids:["24 mois","5 ans / 200 000 km",120,2.5,2.3,"Recyclage 24 mois","Contrôle 12 mois"]},
    {fams:["M20A","A25A","1ZZ","P5Di"],fuel:"h",base:15000,months:12,
     oil:["0W-20 hybride",4],dist:["Chaîne — sans remplacement programmé",0,0],
     items:[["Filtre à huile + huile moteur",15000,0],["Filtre à air",30000,0],["Filtre habitacle",15000,0],["Bougies d'allumage",90000,0],["Liquide de freins",0,24],["Filtre batterie HV (habitacle)",30000,0],["Batterie 12V",0,48]],
     controls:["Contrôle système hybride et isolement","Contrôle plaquettes (régénératives)","Contrôle liquide de refroidissement moteur/inv.","Diagnostic calculateurs hybrides","Contrôle courroie accessoires"],
     fluids:["24 mois","5 ans",110,2.5,2.3,"Recyclage 24 mois","Contrôle 12 mois"]},
    {fams:["E-GMP","ID4","TM3","TMY","VP6","EM4","DREV","FBEV"],fuel:"b",base:20000,months:24,
     oil:["Réducteur / pas de vidange moteur",0],dist:["Pas de distribution thermique",0,0],
     items:[["Filtre habitacle",20000,0],["Liquide de freins",0,24],["Liquide de refroidissement batterie",0,48],["Filtre batterie HV",40000,0],["Batterie 12V",0,48],["Contrôle isolement HV",40000,0]],
     controls:["Contrôle plaquettes et disques (peu sollicités)","Contrôle suspension et silentblocs","Diagnostic batteries HV et isolement","Contrôle connecteurs HV et refroidissement","Mise à jour logiciels embarqués"],
     fluids:["24 mois","48 mois",110,2.5,2.3,"—","Contrôle 12 mois"]}
  ],
  cand:[
    {type:"Modèle",brand:"byd",model:"Seal U DM-i",phase:1,code:"Byd-Super",label:"1.5 Ti DM-i 218",hp:218,nm:300,disp:1498,fuel:"p",gb:"ECVT",y0:2024,y1:2027,seg:"S",note:"Hybride rechargeable BYD, arrivée Europe 2024"},
    {type:"Motorisation",brand:"peugeot",model:"3008 III",phase:1,code:"EP6FADTX",label:"1.6 Hybrid 225 e-EAT8",hp:225,nm:360,disp:1598,fuel:"p",gb:"EAT8",y0:2024,y1:2027,seg:"S",note:"Nouvelle génération 3008 III 2024"},
    {type:"Marque",brand:"zeekr",model:"X",phase:1,code:"Zeekr-E",label:"Dual Motor 490 kW",hp:666,nm:680,disp:0,fuel:"b",gb:"BVM",y0:2025,y1:2027,seg:"S",note:"Entrée Zeekr en Europe"},
    {type:"Motorisation",brand:"renault",model:"Scenic E-Tech",phase:1,code:"CMF-B-EV",label:"Scenic E-Tech 160 kW",hp:218,nm:300,disp:0,fuel:"b",gb:"BVM",y0:2024,y1:2027,seg:"S",note:"Scenic 100% électrique 2024"},
    {type:"Modèle",brand:"cupra",model:"Tavascan",phase:1,code:"Cupra-AW",label:"Tavascan 250 kW",hp:340,nm:545,disp:0,fuel:"b",gb:"BVM",y0:2024,y1:2027,seg:"S",note:"Cupra Tavascan EV"},
    {type:"Motorisation",brand:"toyota",model:"C-HR II",phase:1,code:"M20A-FXS",label:"2.0 Hybrid 197 e-CVT",hp:197,nm:190,disp:1987,fuel:"h",gb:"CVT",y0:2023,y1:2027,seg:"S",note:"Nouveau C-HR hybride 2023"}
  ]
};
window.MD_RAW_OK=true;
if(window.MD_SCRIPTS)window.MD_SCRIPTS.data=true;
})();
