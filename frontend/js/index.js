/*Codigo para agregar funcionalidad al carrosel*/
const images = document.querySelectorAll('.carousel-image');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

let current = 0;

function showImage(index) {
  images.forEach(img => img.classList.remove('active'));

  for (let i = 0; i < 3; i++) {
    const img = images[index + i];
    if (img) {
      img.classList.add('active');
    }
  }
}

nextBtn.addEventListener('click', () => {
  if (current + 3 < images.length) {
    current += 3;
  } else {
    current = 0; 
  }
  showImage(current);
});

prevBtn.addEventListener('click', () => {
  if (current - 3 >= 0) {
    current -= 3;
  } else {
    current = Math.max(images.length - 3, 0); 
  }
  showImage(current);
});

showImage(current);
