async function getJSON(path){
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  return res.json();
}

export async function loadData(){
  const [people, messages, photos, ui] = await Promise.all([
    getJSON('data/people.json'),
    getJSON('data/messages.json'),
    getJSON('data/photos.json'),
    getJSON('content/en.json')
  ]);
  return { people, messages, photos, ui };
}
