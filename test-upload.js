async function run() {
  const form = new FormData();
  form.append('file', new Blob(['test image content'], { type: 'image/jpeg' }), 'test.jpg');

  try {
    const res = await fetch('http://localhost:8080/_server/?fn=uploadImage', {
      method: 'POST',
      body: form,
    });
    
    console.log('Status:', res.status);
    console.log('Text:', await res.text());
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
