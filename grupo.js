import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
const tituloGrupo = document.getElementById("tituloGrupo");
const hoje = document.getElementById("hoje");
const proximos = document.getElementById("proximos");
const feitos = document.getElementById("feitos");
const btnVoltar = document.getElementById("btnVoltar");
const secaoFeitos = document.getElementById("secaoFeitos");
const secaoHoje = document.getElementById("secaoHoje");
const secaoProximos = document.getElementById("secaoProximos");
const tituloMes = document.getElementById("tituloMes");
const btnGerenciar = document.getElementById("btnGerenciar");
const usuario = JSON.parse(localStorage.getItem("usuario"));
const mensagemSucesso =
    document.getElementById("mensagemSucesso");
const modalMensagem =
    document.getElementById("modalMensagem");
const textoMensagem =
    document.getElementById("textoMensagem");
const btnCopiarMensagem =
    document.getElementById("btnCopiarMensagem");
const btnCancelarMensagem =
    document.getElementById("btnCancelarMensagem");
const logoGrupo = document.getElementById("logoGrupo");

if (!usuario) {
    window.location.href = "index.html";
}

const parametros = new URLSearchParams(window.location.search);
const grupoSelecionado = parametros.get("nome");

// SOM DE ENTRADA DO GRUPO
const sonsGrupo = {
    Jovens: "audio/jovens.AAC",
    Banda: "audio/banda.AAC",
    Orquestra: "audio/orquestra.AAC",
    Coral: "audio/coral.AAC",
    Adolescentes: "audio/adolescentes.AAC",
    Irmãs: "audio/irmas.AAC"

};

if (sonsGrupo[grupoSelecionado]) {
    const audio = new Audio(sonsGrupo[grupoSelecionado]);
    audio.volume = 0.5;

    audio.play().catch(() => {
        console.log("Áudio bloqueado pelo navegador");
    });
}

if (grupoSelecionado === "Jovens") {
    logoGrupo.src = "image/logojovens.png";

} else if (grupoSelecionado === "Banda") {
    logoGrupo.src = "image/logobanda.png";

} else if (grupoSelecionado === "Orquestra") {
    logoGrupo.src = "image/logoorquestra.png";

} else if (grupoSelecionado === "Coral") {
    logoGrupo.src = "image/logocoral.png";

} else if (grupoSelecionado === "Adolescentes") {
    logoGrupo.src = "image/logoadolescentes.png";

} else if (grupoSelecionado === "Irmãs") {
    logoGrupo.src = "image/logoirmas.png";
}

if (btnGerenciar) {

    btnGerenciar.addEventListener("click", () => {
        window.location.href =
            "gerenciar.html?grupo=" + grupoSelecionado;
    });
}

btnVoltar.addEventListener("click", () => {
    window.location.href = "home.html";
});

async function carregarAniversariantes() {
    document.getElementById("carregando").style.display = "block";
    const aniversariantesRef = collection(db, "aniversariantes");
    const resultado = await getDocs(aniversariantesRef);
    const dataAtual = new Date();
    const diaAtual = dataAtual.getDate();
    const mesAtual = dataAtual.getMonth() + 1;
    const nomesMeses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];

    tituloGrupo.textContent = `${grupoSelecionado} - ${nomesMeses[mesAtual - 1]}`;
    tituloMes.textContent = `- ${nomesMeses[mesAtual - 1]}`;
    const listaHoje = [];
    const listaProximos = [];
    const listaFeitos = [];

    resultado.forEach((doc) => {
        const aniversario = doc.data();

        if (!aniversario.grupos.includes(grupoSelecionado)) {
            return;
        }

        if (aniversario.mes !== mesAtual) {
            return;
        }

        if (aniversario.dia === diaAtual) {
            listaHoje.push(aniversario);
        } else if (aniversario.dia > diaAtual) {
            listaProximos.push(aniversario);
        } else {
            listaFeitos.push(aniversario);
        }
    });

    listaProximos.sort((a, b) => a.dia - b.dia);
    listaFeitos.sort((a, b) => a.dia - b.dia);

    mostrarLista(listaFeitos, feitos, secaoFeitos);
    mostrarLista(listaHoje, hoje, secaoHoje);
    mostrarLista(listaProximos, proximos, secaoProximos);

    document.getElementById("carregando").style.display = "none";
}

function mostrarLista(lista, elemento, secao) {
    if (lista.length === 0) {
        secao.style.display = "none";
        return;
    }

    lista.forEach((aniversario) => {
        const dia = String(aniversario.dia).padStart(2, "0");
        const mes = String(aniversario.mes).padStart(2, "0");
        const card = document.createElement("div");

        card.className = "card-aniversario";

        if (elemento.id === "hoje") {

            card.innerHTML = `
        <div class="nome-aniversariante">
            <strong>${aniversario.nome}</strong>

            <span 
                class="gerar-mensagem"
                data-nome="${aniversario.nome}">
                  Mandar mensagem
            </span>
        </div>

        <span>${dia}/${mes}</span>
    `;

        } else {

            card.innerHTML = `
        <strong>${aniversario.nome}</strong>
        <span>${dia}/${mes}</span>
    `;

        }
        const botaoMensagem =
            card.querySelector(".gerar-mensagem");

        if (botaoMensagem) {

            botaoMensagem.addEventListener("click", () => {

                const nome =
                    botaoMensagem.dataset.nome;

                const mensagem =
                    `🎉 Hoje celebramos mais um ano de vida de uma pessoa muito especial! Feliz aniversário, ${nome}!

Que Deus continue abençoando sua vida, concedendo saúde, alegria e muitos anos de vida.

Que este novo ciclo seja cheio da presença de Deus e de grandes realizações.

Parabéns! 🎂`;

                textoMensagem.value = mensagem;

                modalMensagem.style.display = "flex";
            });
        }

        elemento.appendChild(card);
    });
}

btnCancelarMensagem.addEventListener("click", () => {

    modalMensagem.style.display = "none";

});


btnCopiarMensagem.addEventListener("click", () => {

    navigator.clipboard.writeText(
        textoMensagem.value
    );


    modalMensagem.style.display = "none";

    mensagemSucesso.textContent =
        "Mensagem copiada!";

    mensagemSucesso.className =
        "mensagem-sucesso mensagem-adicionado";

    mensagemSucesso.style.display = "block";

    setTimeout(() => {

        mensagemSucesso.style.display = "none";

    }, 2500);

});
carregarAniversariantes();