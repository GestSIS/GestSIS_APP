// Un article qui est lui-même un emplacement (ex: véhicule) n'a pas son propre
// emplacement_id : sa position est portée par le parent_id de l'emplacement qu'il
// représente.
export const emplacementIdPourArticle = (article) =>
  article?.emplacement_representee?.parent_id ?? article?.emplacement_id ?? null;
