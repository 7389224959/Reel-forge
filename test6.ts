async function run() {
  const keyword = "happy person";
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(keyword + " filetype:bitmap")}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&origin=*&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'aistudio-build/1.0' } });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
