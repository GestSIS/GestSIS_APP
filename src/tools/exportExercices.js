export const exercicesToIcs = (exercices, sisName, sisKey, annee) => {
  if (exercices.length <= 0) {
    throw "Aucun exercice à exporter";
  }

  const header = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:GestSIS:2.0
`;
  const footer = `\nEND:VCALENDAR`;
  const events = exercices
    .map(
      (e) => `BEGIN:VEVENT
UID:${sisKey}-${e.id}@gestsis.ch
DTSTAMP:${new Date().toISOString().replaceAll("-", "").replaceAll(":", "").slice(0, 15)}
DTSTART:${e.date.replaceAll("-", "") + "T" + e.heure.replaceAll(":", "")}
DURATION:PT${e.duree}M
SUMMARY:${e.categorie} : ${e.designation}
ORGANIZER:${sisName}
DESCRIPTION:${e.communications}
CATEGORIES:${e.categorie}
LOCATION:${e.localite} ${e.lieu}
COLOR:darkred
END:VEVENT`,
    )
    .join("\n");

  const data = (header + events + footer).replaceAll("\n", "\r\n");

  // V-Card for all
  const file = new Blob([data], { type: "text/calendar" });
  const a = document.createElement("a");
  const url = URL.createObjectURL(file);

  a.href = url;
  a.download =
    `sis_${sisKey}_exercices_${annee}`
      .replaceAll(" ", "_")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase() + ".ics";

  document.body.appendChild(a);

  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
};
