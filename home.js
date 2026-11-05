import { getToken } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging.js";
import { auth, messaging } from "./firebase-config.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

import {
    db
} from "./firebase-config.js";


const nomeUsuario = document.getElementById("nomeUsuario");
const grupos = document.getElementById("grupos");
const btnSair = document.getElementById("btnSair");
const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
    window.location.href = "index.html";
}

nomeUsuario.innerHTML = `Olá, <strong>${usuario.nome}</strong>! Que tal dar uma olhadinha nos Nivers do mês?`;
const todosGrupos = ["Banda", "Jovens", "Orquestra", "Coral", "Adolescentes", "Irmãs"];
const gruposOrdenados = [
    ...usuario.grupos,
    ...todosGrupos.filter(
        grupo => !usuario.grupos.includes(grupo)
    )
];

gruposOrdenados.forEach((grupo) => {

    const botao = document.createElement("button");

    botao.className = `card-grupo ${grupo.toLowerCase()}`;

    if (grupo === "Jovens") {

        botao.innerHTML = `
        <div class="imagem-grupo jovens-imagem"></div>
        <div class="conteudo-grupo">
            <span>${grupo}</span>
        </div>
        <img src="image/logojovens.png" class="logo-grupo">
    `;

    } else if (grupo === "Banda") {

        botao.innerHTML = `
    <div class="imagem-grupo banda-imagem"></div>
    <div class="conteudo-grupo">
        <span>${grupo}</span>
    </div>
    <img src="image/logobanda.png" class="logo-grupo">
`;
    } else if (grupo === "Orquestra") {

        botao.innerHTML = `
    <div class="imagem-grupo orquestra-imagem"></div>
    <div class="conteudo-grupo">
        <span>${grupo}</span>
    </div>
    <img src="image/logoorquestra.png" class="logo-grupo">
`;
    } else if (grupo === "Coral") {

        botao.innerHTML = `
    <div class="imagem-grupo coral-imagem"></div>

    <div class="conteudo-grupo">
        <span>${grupo}</span>
    </div>

    <img src="image/logocoral.png" class="logo-grupo">
`;

    } else if (grupo === "Adolescentes") {

        botao.innerHTML = `
        <div class="imagem-grupo adolescentes-imagem"></div>

        <div class="conteudo-grupo">
            <span>${grupo}</span>
        </div>

        <img src="image/logoadolescentes.png" class="logo-grupo">
    `;
    } else if (grupo === "Irmãs") {

        botao.innerHTML = `
        <div class="imagem-grupo irmas-imagem"></div>

        <div class="conteudo-grupo">
            <span>${grupo}</span>
        </div>

        <img src="image/logoirmas.png" class="logo-grupo">
    `;
    }



    botao.addEventListener("click", () => {

        if (usuario.grupos.includes(grupo)) {

            console.log("Acesso permitido:", grupo);
            window.location.href = `grupo.html?nome=${grupo}`;

        } else {

            mostrarMensagemPermissao();
        }
    });

    grupos.appendChild(botao);
});

function mostrarMensagemPermissao() {

    const mensagem = document.createElement("div");

    mensagem.className = "mensagem-permissao";
    mensagem.textContent = "😞 Você não possui permissão para acessar este grupo.";
    document.body.appendChild(mensagem);


    setTimeout(() => {
        mensagem.classList.add("sair");

    }, 2500);

    setTimeout(() => {
        mensagem.remove();

    }, 3000);
}

btnSair.addEventListener("click", async () => {
    await signOut(auth);
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
});

ativarNotificacoes();

async function ativarNotificacoes() {

    try {

        const permissao = await Notification.requestPermission();

        if (permissao === "granted") {

            const registration = await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );

            const token = await getToken(
                messaging,
                {
                    vapidKey: "BJu3zuiGfla9aLGkBtKvf5f49IUhpc5gGpK9d9Dtm025fPJbiwShH2uywO-CeCP-dyZUJJOIcM9jnchLGl0Vawo",
                    serviceWorkerRegistration: registration
                }
            );

            console.log(
                "TOKEN DO CELULAR:",
                token
            );

            console.log("PASSOU 1");

            console.log(
                "USUARIO:",
                usuario
            );

            console.log("PASSOU 2");

            console.log(
                "ID USUARIO:",
                usuario.id
            );

            console.log("PASSOU 3");

            const usuarioRef = doc(db, "usuarios", usuario.id);
            const tokensAtuais = usuario.tokens || [];

            if (!tokensAtuais.includes(token)) {

                await updateDoc(
                    usuarioRef,
                    {
                        tokens: [
                            ...tokensAtuais,
                            token
                        ]
                    }
                );

                console.log("Novo token adicionado");

            } else {

                console.log("Token já estava salvo");

            }

            console.log("Token salvo no Firestore", token);
        } else {

            console.log("Notificações negadas");
        }


    } catch (erro) {

        console.error(
            "Erro notificações:",
            erro
        );

        console.error(
            "Código:",
            erro.code
        );

        console.error(
            "Mensagem:",
            erro.message
        );

    }

}
