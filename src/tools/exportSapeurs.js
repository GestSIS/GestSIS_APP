export const downloadVcard = (sapeurs, localites, orgName, sisKey) => {
  if (sapeurs.length <= 0) {
    throw new Error("Aucun sapeur à exporter");
  }

  const telephoneTypeMapping = {
    1: "HOME",
    2: "WORK",
    3: "CELL",
  };
  const civiliteMapping = {
    1: "Mr.",
    2: "Mme.",
  };
  const genderMapping = {
    1: "M",
    2: "F",
  };

  const idReducer = (map, e) => {
    map.set(e.id, e);
    return map;
  };
  const indexedLocalite = localites.reduce(idReducer, new Map());

  const formatNumero = (numero) => {
    const num = numero.replaceAll(" ", "").replaceAll("-", "");
    if (num.length == 10 && num.startsWith("0")) {
      return "+41" + num.substring(1);
    }
    return num;
  };

  // RFC 6350 §3.4: backslash, comma, semicolon and newline must be escaped in text values.
  const escapeText = (value) =>
    String(value ?? "")
      .replaceAll("\\", "\\\\")
      .replaceAll("\n", "\\n")
      .replaceAll(",", "\\,")
      .replaceAll(";", "\\;");

  const contacts = sapeurs
    .map((s) => {
      const localite = indexedLocalite.get(s.localite_id);
      return [
        "BEGIN:VCARD",
        "VERSION:4.0",
        ...(sisKey ? [`UID:urn:gestsis:${escapeText(sisKey)}:sapeur:${s.id}`] : []),
        `N:${escapeText(s.nom)};${escapeText(s.prenom)};;${civiliteMapping[s.civilite_id]};`,
        `FN:${escapeText(`${s.prenom} ${s.nom}`)}`,
        ...(orgName ? [`ORG:${escapeText(orgName)}`] : []),
        "LANG:fr-CH",
        "KIND:individual",
        `GENDER:${genderMapping[s.civilite_id]}`,
        ...s.telephones.map(
          (t) =>
            "TEL;TYPE=" +
            telephoneTypeMapping[t.telephone_type_id] +
            ";VALUE=uri:tel:" +
            formatNumero(t.numero),
        ),
        `ADR;TYPE=HOME:;;${escapeText(`${s.rue} ${s.no_rue}`)};${escapeText(localite?.designation)};;${escapeText(localite?.npa)};Suisse`,
        ...(s.email ? [`EMAIL:${s.email}`] : []),
        `BDAY:${s.date_naissance?.replaceAll("-", "") ?? ""}`,
        "CATEGORIES:SIS",
        "PRODID:-//GestSIS//GestSIS 2.0//FR",
        "END:VCARD",
      ].join("\n");
    })
    .join("\n")
    .replaceAll("\n", "\r\n");

  // V-Card for all
  const file = new Blob([contacts], { type: "text/plain" });
  const a = document.createElement("a");
  const url = URL.createObjectURL(file);

  a.href = url;
  a.download =
    sapeurs.length == 1
      ? sapeurs[0].nom_prenom
          .replaceAll(" ", "_")
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase() + ".vcf"
      : "sis_vcard.vcf";

  document.body.appendChild(a);

  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
};
