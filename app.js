import { auth, db } from "./firebase-config.js";
import {
    browserLocalPersistence,
    onAuthStateChanged,
    setPersistence,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const email = document.getElementById("email");
const senha = document.getElementById("senha");
const btnLogin = document.getElementById("btnLogin");
const mensagemErroLogin = document.getElementById("mensagemErroLogin");
const btnInstalar = document.getElementById("btnInstalar");
const btnOlho = document.getElementById("btnOlho");
const iconeOlho = document.getElementById("iconeOlho");
let instalacaoPWA = null;

onAuthStateChanged(auth, async (usuarioFirebase) => {
    if (!usuarioFirebase) {
        return;
    }

    try {
        const usuariosRef = collection(db, "usuarios");
        const buscaUsuario = query(
            usuariosRef,
            where("e-mail", "==", usuarioFirebase.email)
        );
        const resultado = await getDocs(buscaUsuario);

        if (resultado.empty) {
            localStorage.removeItem("usuario");
            mensagemErroLogin.textContent = "Usuário sem permissão cadastrado.";
            mensagemErroLogin.style.display = "block";
            return;
        }

        const documento = resultado.docs[0];
        const dadosUsuario = documento.data();
        delete dadosUsuario.token;

        localStorage.setItem("usuario", JSON.stringify({
            id: documento.id,
            ...dadosUsuario
        }));

        window.location.href = "home.html";
    } catch (erro) {
        console.error("Erro ao restaurar a sessão:", erro);
        mensagemErroLogin.textContent = "Não foi possível validar seu acesso. Tente novamente.";
        mensagemErroLogin.style.display = "block";
    }
});

btnOlho.addEventListener("click", () => {

    if (senha.type === "password") {

        senha.type = "text";
        btnOlho.setAttribute("aria-label", "Ocultar senha");
        iconeOlho.innerHTML = `
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a17.7 17.7 0 0 1-3.1 4.4" />
            <path d="M6.2 6.2C3.7 8 2 12 2 12s3.5 8 10 8c1.5 0 2.8-.3 4-.8" />
        `;

    } else {

        senha.type = "password";

        btnOlho.setAttribute("aria-label", "Mostrar senha");

        iconeOlho.innerHTML = `
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
        `;
    }
});


// Captura instalação do PWA
window.addEventListener("beforeinstallprompt", (evento) => {

    evento.preventDefault();
    instalacaoPWA = evento;
    console.log("PWA disponível para instalar");

    if (btnInstalar) {
        btnInstalar.style.display = "block";
    }
});

// Botão instalar
if (btnInstalar) {

    btnInstalar.addEventListener("click", async () => {

        if (!instalacaoPWA) {
            alert("Instalação não disponível neste momento.");
            return;
        }

        instalacaoPWA.prompt();
        const resultado = await instalacaoPWA.userChoice;

        if (resultado.outcome === "accepted") {
            console.log("Usuário instalou o app");
        } else {
            console.log("Usuário cancelou");
        }
        instalacaoPWA = null;
    });
}

btnLogin.addEventListener("click", async () => {

    try {
        await setPersistence(auth, browserLocalPersistence);
        await signInWithEmailAndPassword(
            auth,
            email.value,
            senha.value
        );

    } catch (erro) {

        console.error(erro);
        mensagemErroLogin.textContent = "E-mail ou senha incorretos.";
        mensagemErroLogin.style.display = "block";
    }

});
