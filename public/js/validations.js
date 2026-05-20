/* =========================================================================
   public/js/validations.js  ·  ParkSpot
   Validaciones del lado cliente para los formularios de login y registro.
   Muestra mensajes de error junto a cada campo antes de enviar al servidor.
   (El servidor SIEMPRE vuelve a validar: esto es solo una mejora de UX.)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', function () {

    // Muestra un mensaje de error debajo de un campo concreto.
    function setError(form, fieldName, message) {
        const box = form.querySelector('.field-error[data-for="' + fieldName + '"]');
        if (box) box.textContent = message || '';
    }

    function limpiarErrores(form) {
        form.querySelectorAll('.field-error').forEach(b => (b.textContent = ''));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ---------- Formulario de LOGIN ----------
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            limpiarErrores(loginForm);
            let ok = true;

            const correo = loginForm.correo.value.trim();
            const pass   = loginForm.contrasena.value;

            if (!emailRegex.test(correo)) {
                setError(loginForm, 'correo', 'Ingresa un correo válido.');
                ok = false;
            }
            if (pass.length === 0) {
                setError(loginForm, 'contrasena', 'La contraseña es obligatoria.');
                ok = false;
            }
            if (!ok) e.preventDefault();
        });
    }

    // ---------- Formulario de REGISTRO ----------
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            limpiarErrores(registerForm);
            let ok = true;

            const nombre    = registerForm.nombre.value.trim();
            const apellido  = registerForm.apellido.value.trim();
            const correo    = registerForm.correo.value.trim();
            const pass      = registerForm.contrasena.value;
            const confirmar = registerForm.confirmar.value;

            if (nombre === '')   { setError(registerForm, 'nombre', 'Ingresa tu nombre.'); ok = false; }
            if (apellido === '') { setError(registerForm, 'apellido', 'Ingresa tu apellido.'); ok = false; }
            if (!emailRegex.test(correo)) { setError(registerForm, 'correo', 'Correo no válido.'); ok = false; }
            if (pass.length < 8) {
                setError(registerForm, 'contrasena', 'Mínimo 8 caracteres.');
                ok = false;
            }
            if (pass !== confirmar) {
                setError(registerForm, 'confirmar', 'Las contraseñas no coinciden.');
                ok = false;
            }
            if (!ok) e.preventDefault();
        });
    }
});
