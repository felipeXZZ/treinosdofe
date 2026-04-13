/**
 * Mapeamento de nome de exercício → URL do GIF demonstrativo.
 * Adicione ou altere URLs conforme necessário.
 * As chaves devem ser minúsculas para comparação case-insensitive.
 */
export const EXERCISE_GIFS: Record<string, string> = {
  "crucifixo (máquina ou polia)":
    "https://www.hipertrofia.org/blog/wp-content/uploads/2023/09/lever-seated-fly.gif",
  "supino máquina":
    "https://www.hipertrofia.org/blog/wp-content/uploads/2023/09/lever-seated-fly.gif",
  "supino inclinado máquina":
    "https://www.hipertrofia.org/blog/wp-content/uploads/2019/01/supino-vertical.gif",
  "puxada na frente":
    "https://www.hipertrofia.org/blog/wp-content/uploads/2019/05/cable-pulldown.gif",
  "remada máquina":
    "https://image.tuasaude.com/media/article/dm/wv/remada_75622.gif?width=686&height=487",
  "elevação lateral (halter)":
    "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/ombros-elevacao-lateral-de-ombros-com-halteres.gif",
  "elevação lateral halter":
    "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/ombros-elevacao-lateral-de-ombros-com-halteres.gif",
  "tríceps corda":
    "https://media.tenor.com/mbebKudZjxYAAAAM/tr%C3%ADceps-pulley.gif",
  "rosca direta":
    "https://www.hipertrofia.org/blog/wp-content/uploads/2019/04/rosca-direta-polia.gif",
  "rosca alternada":
    "https://www.hipertrofia.org/blog/wp-content/uploads/2023/09/alternating-dumbbell-curl.gif",
  "rosca scott":
    "https://www.mundoboaforma.com.br/wp-content/uploads/2020/11/Rosca-Scott-com-halteres-unilateral.gif",
  "hack machine":
    "https://image.tuasaude.com/media/article/cu/uv/agachamento-hack_75592.gif?width=686&height=487",
  "hack machine (leve)":
    "https://image.tuasaude.com/media/article/cu/uv/agachamento-hack_75592.gif?width=686&height=487",
  "hack machine leve":
    "https://image.tuasaude.com/media/article/cu/uv/agachamento-hack_75592.gif?width=686&height=487",
  "leg press":
    "https://image.tuasaude.com/media/article/nb/le/leg-press_75589.gif?width=686&height=487",
  "leg press (pé mais baixo)":
    "https://image.tuasaude.com/media/article/nb/le/leg-press_75589.gif?width=686&height=487",
  "leg press pé mais baixo":
    "https://image.tuasaude.com/media/article/nb/le/leg-press_75589.gif?width=686&height=487",
  "cadeira extensora":
    "https://www.hipertrofia.org/blog/wp-content/uploads/2023/11/lever-leg-extension.gif",
  "mesa flexora":
    "https://www.mundoboaforma.com.br/wp-content/uploads/2021/04/pernas-flexao-de-pernas-na-maquina.gif",
  "cadeira flexora":
    "https://www.hipertrofia.org/blog/wp-content/uploads/2024/12/cadeira-flexora.gif",
  "panturrilha":
    "https://i.pinimg.com/originals/19/54/4f/19544f4e21322137847a25acd501a18a.gif",
  "crucifixo inverso":
    "https://www.hipertrofia.org/blog/wp-content/uploads/2018/03/lever-seated-reverse-fly-parallel-grip.gif",
  "lateral (tríceps com chifre)":
    "https://i0.wp.com/omelhortreino.com.br/wp-content/uploads/2025/04/Triceps-frances-na-polia-com-corda.gif?resize=550%2C550&ssl=1",
  "tríceps crossover (chifre)":
    "https://i0.wp.com/omelhortreino.com.br/wp-content/uploads/2025/04/Triceps-frances-na-polia-com-corda.gif?resize=550%2C550&ssl=1",
  "desenvolvimento ombro máquina":
    "https://media.tenor.com/vFJSvh8AvhAAAAAM/a1.gif",
  "elevação lateral (leve)":
    "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/ombros-elevacao-lateral-de-ombros-com-halteres.gif",
};

/**
 * Retorna a URL do GIF para um exercício (case-insensitive, ignora acentos parcialmente).
 */
export function getExerciseGif(name: string): string | null {
  const key = name.toLowerCase().trim();
  return EXERCISE_GIFS[key] ?? null;
}
