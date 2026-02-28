export interface Background {
  id: string;
  label: string;
  description: string;
  url: string | null;       // full-res for background
  thumb: string | null;     // thumbnail for picker
}

const BASE = "https://images.unsplash.com";

function bg(id: string, photoId: string, label: string, description: string): Background {
  return {
    id,
    label,
    description,
    url:   `${BASE}/photo-${photoId}?w=1920&q=70&auto=format&fit=crop`,
    thumb: `${BASE}/photo-${photoId}?w=400&h=260&q=60&auto=format&fit=crop`,
  };
}

export const BACKGROUNDS: Background[] = [
  {
    id: "none",
    label: "Solo estrellas",
    description: "Campo de estrellas animado",
    url: null,
    thumb: null,
  },
  bg("golden-dog",     "1552053831-71594a27632d", "Luz dorada",        "Golden retriever en luz de atardecer"),
  bg("sleeping-dog",   "1587300003388-59208cc962cb", "Sueño eterno",   "Labrador en hojas de otoño"),
  bg("collie",         "1518717758536-85ae29035b6d", "Ojos del alma",  "Border collie, mirada profunda"),
  bg("husky",          "1543466835-00a7907e9de1", "Espíritu libre",    "Husky siberiano en tonos azules"),
  bg("cat-portrait",   "1574158622682-e40e69881006", "Alma felina",    "Retrato de gato, tonos cálidos"),
  bg("dog-flowers",    "1561037404-61cd46aa615b", "Entre flores",      "Perro en campo de flores"),
  bg("starry-night",   "1444703686981-a3abbc4d4fe3", "Puente de estrellas", "Cielo nocturno estrellado"),
  bg("misty-forest",   "1425913397330-cf8af2ff40a1", "Bosque eterno",  "Senda entre árboles con neblina"),
  bg("cherry-blossom", "1490750967868-88df5691afa4", "Flor de cerezo", "Flores de cerezo en primavera"),
  bg("candles",        "1509048191080-d2984bad6ae5", "Llama memorial", "Velas encendidas en memoria"),
  bg("golden-sunset",  "1504701954957-2010ec3bcec1", "Último atardecer", "Campo dorado bajo el ocaso"),
  bg("northern-lights","1531366936337-7c912a4589a7", "Aurora boreal",  "Luces del norte, colores del cielo"),
];

export function getBackground(id: string): Background {
  return BACKGROUNDS.find(b => b.id === id) ?? BACKGROUNDS[0];
}
