const signoSelect = document.getElementById('signo-select');
if (signoSelect) {
  signoSelect.addEventListener('change', async function () {
    const signo = this.value;
    const resultadoDiv = document.getElementById('resultado-horoscopo');

    if (!signo) {
      resultadoDiv.innerHTML = '';
      return;
    }

    try {
      const response = await fetch(`https://corsproxy.io/?https://ohmanda.com/api/horoscope/${signo}`);

      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      const data = await response.json();

      resultadoDiv.innerHTML = `
        <h3>${signo.toUpperCase()}</h3>
        <p>${data.horoscope}</p>
      `;
    } catch (error) {
      resultadoDiv.innerHTML = '<p>Error al obtener el horóscopo. Inténtalo más tarde.</p>';
      console.error(error);
    }
  });
}

document.querySelector('.form-consulta')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const tipo = document.getElementById('tipo').value;
  const mensaje = document.getElementById('mensaje').value;

  const datos = { nombre, email, tipo, mensaje };

  try {
  const res = await fetch('/api/consultas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // necesario para enviar la cookie con el token
  body: JSON.stringify(datos)
});


    if (!res.ok) throw new Error('Error al enviar');

    alert('¡Consulta guardada correctamente!');
    this.reset();
  } catch (err) {
    console.error(err);
    alert('Error al guardar la consulta.');
  }
});

const productos = {
  amor: [
    { nombre: 'Vela Rosa', precio: '$80', desc: 'Atrae el amor y dulzura.', img: 'img/amor1.jpg' },
    { nombre: 'Cuarzo Rosa', precio: '$100', desc: 'Cristal de amor y armonía.', img: 'img/amor2.jpg' },
    { nombre: 'Aceite de Pasión', precio: '$90', desc: 'Activa energía amorosa.', img: 'img/amor3.jpg' }
  ],
  proteccion: [
    { nombre: 'Amuleto Ojo Turco', precio: '$70', desc: 'Protección contra malas energías.', img: 'img/proteccion1.jpg' },
    { nombre: 'Incienso de Ruda', precio: '$60', desc: 'Limpieza energética.', img: 'img/proteccion2.jpg' },
    { nombre: 'Pulsera de Obsidiana', precio: '$110', desc: 'Bloquea energías negativas.', img: 'img/proteccion3.jpg' }
  ],
  salud: [
    { nombre: 'Hierbas Curativas', precio: '$50', desc: 'Infusión para el bienestar.', img: 'img/salud1.jpg' },
    { nombre: 'Vela Verde', precio: '$75', desc: 'Renueva la salud física.', img: 'img/salud2.jpg' },
    { nombre: 'Baño Energético', precio: '$95', desc: 'Limpia el cuerpo y el alma.', img: 'img/salud.jpg' }
  ]
};

function mostrarProductos(categoria) {
  const lista = productos[categoria];
  const contenedor = document.getElementById('productos-lista');
  document.getElementById('titulo-modal').innerText = `Productos de ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`;
  contenedor.innerHTML = '';

  lista.forEach((prod, i) => {
    const div = document.createElement('div');
    div.className = 'producto-mini';
    div.innerHTML = `
      <img src="${prod.img}" alt="${prod.nombre}" />
      <p>${prod.nombre}</p>
      <button onclick="verDetalle('${categoria}', ${i})">Ver más</button>
    `;
    contenedor.appendChild(div);
  });

  document.getElementById('modal-productos').classList.remove('hidden');
}

function cerrarModal() {
  document.getElementById('modal-productos').classList.add('hidden');
}

function verDetalle(categoria, index) {
  const prod = productos[categoria][index];
  document.getElementById('detalle-img').src = prod.img;
  document.getElementById('detalle-nombre').innerText = prod.nombre;
  document.getElementById('detalle-desc').innerText = prod.desc;
  document.getElementById('detalle-precio').innerText = `Precio: ${prod.precio}`;

  document.getElementById('modal-detalle').classList.remove('hidden');
}

function cerrarDetalle() {
  document.getElementById('modal-detalle').classList.add('hidden');
}

function comprarProducto() {
  alert('✅ ¡Compra realizada! Gracias por tu confianza.');
  cerrarDetalle();
  cerrarModal();
}

function mostrarProductos(categoria) {
  const secciones = document.querySelectorAll('.categoria-productos');
  secciones.forEach(seccion => seccion.style.display = 'none');

  const seccionActiva = document.getElementById(categoria);
  if (seccionActiva) {
    seccionActiva.style.display = 'block';
    seccionActiva.scrollIntoView({ behavior: 'smooth' });
  }
}

// Manejo de inicio de sesión y registro
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(loginForm);
      const data = {
        username: formData.get('username'),
        password: formData.get('password')
      };

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        const texto = await res.text();
        console.log('Respuesta del servidor:', texto);

        if (res.ok) {
          console.log('Redirigiendo a privado.html...');
          location.href = 'privado.html';
        } else {
          alert('Credenciales inválidas');
        }

      } catch (err) {
        console.error('Error al iniciar sesión:', err);
        alert('Error al procesar el inicio de sesión.');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(registerForm);
      const data = {
        username: formData.get('username'),
        password: formData.get('password')
      };

      try {
        const res = await fetch('/api/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (res.ok) {
          alert('Registro exitoso. Inicia sesión.');
          registerForm.reset();
        } else {
          alert('Error al registrarse.');
        }
      } catch (err) {
        console.error('Error en el registro:', err);
        alert('Error al procesar el registro.');
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        alert('Sesión cerrada correctamente');
        location.href = 'login.html';
      } else {
        alert('Error al cerrar sesión');
      }
    });
  }
});
