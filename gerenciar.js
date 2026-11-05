import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    addDoc,
    doc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


const parametros =
    new URLSearchParams(window.location.search);

const grupo =
    parametros.get("grupo");

const tituloGrupo =
    document.getElementById("tituloGrupo");

const listaAniversariantes =
    document.getElementById("listaAniversariantes");

const btnVoltar =
    document.getElementById("btnVoltar");

const btnAdicionar =
    document.getElementById("btnAdicionar");

const modalAdicionar =
    document.getElementById("modalAdicionar");

const btnCancelarAdicionar =
    document.getElementById("btnCancelarAdicionar");

const mensagemSucesso =
    document.getElementById("mensagemSucesso");

const btnSalvarAdicionar =
    document.getElementById("btnSalvarAdicionar");

const mensagemAviso =
    document.getElementById("mensagemAviso");

const modalDuplicidade =
    document.getElementById("modalDuplicidade");

const textoDuplicidade =
    document.getElementById("textoDuplicidade");

const btnAdicionarGrupo =
    document.getElementById("btnAdicionarGrupo");

const btnNovaPessoa =
    document.getElementById("btnNovaPessoa");

const btnCancelarDuplicidade =
    document.getElementById("btnCancelarDuplicidade");

const modalEditar =
    document.getElementById("modalEditar");

const btnSalvarEditar =
    document.getElementById("btnSalvarEditar");

const btnCancelarEditar =
    document.getElementById("btnCancelarEditar");

const pesquisaAniversariante =
    document.getElementById("pesquisaAniversariante");

const btnOrdenarNome =
    document.getElementById("btnOrdenarNome");

const btnOrdenarData =
    document.getElementById("btnOrdenarData");

const btnOrdenarNomeExpandido = document.getElementById("btnOrdenarNomeExpandido");

const btnOrdenarDataExpandido = document.getElementById("btnOrdenarDataExpandido");

const modalExcluir =
    document.getElementById("modalExcluir");

const textoExcluir =
    document.getElementById("textoExcluir");

const btnConfirmarExcluir =
    document.getElementById("btnConfirmarExcluir");

const btnCancelarExcluir =
    document.getElementById("btnCancelarExcluir");

const btnExportarPDF =
    document.getElementById("btnExportarPDF");

const btnVisaoMacro =
    document.getElementById("btnVisaoMacro");

const telaVisaoMacro =
    document.getElementById("telaVisaoMacro");

const telaCalendarioMes =
    document.getElementById("telaCalendarioMes");

const btnVoltarMacro =
    document.getElementById("btnVoltarMacro");

const btnVoltarMes =
    document.getElementById("btnVoltarMes");

const gradeMeses =
    document.getElementById("gradeMeses");

const gradeCalendario =
    document.getElementById("gradeCalendario");

const tituloMesCalendario =
    document.getElementById("tituloMesCalendario");

const subtituloMacro =
    document.getElementById("subtituloMacro");

const modalDiaMacro =
    document.getElementById("modalDiaMacro");

const tituloDiaMacro =
    document.getElementById("tituloDiaMacro");

const listaDiaMacro =
    document.getElementById("listaDiaMacro");

const btnFecharDiaMacro =
    document.getElementById("btnFecharDiaMacro");

const btnImportarNivers =
    document.getElementById("btnImportarNivers");

const modalImportarNivers =
    document.getElementById("modalImportarNivers");

const btnAnalisarNivers =
    document.getElementById("btnAnalisarNivers");

const btnCancelarImportacao =
    document.getElementById("btnCancelarImportacao");

const textoImportarNivers =
    document.getElementById("textoImportarNivers");

const areaTextoImportacao =
    document.getElementById("areaTextoImportacao");

const areaPreviaImportacao =
    document.getElementById("areaPreviaImportacao");

const tituloPreviaImportacao =
    document.getElementById("tituloPreviaImportacao");

const listaPreviaImportacao =
    document.getElementById("listaPreviaImportacao");

const btnConfirmarImportacao =
    document.getElementById("btnConfirmarImportacao");

const btnVoltarPrevia =
    document.getElementById("btnVoltarPrevia");



let niversParaImportar = [];

const logoGrupo = document.getElementById("logoGrupo");

let pessoaExcluindo = null;
let listaAtualAniversariantes = [];
let listaExibidaAtual = [];
let pessoaEditando = null;
let pessoaDuplicadaEncontrada = null;
let tipoOrdenacao = "nome";
let filaDuplicidades = [];
let niverAtualImportacao = null;
let niversNovosImportacao = [];
let linhasNaoIdentificadas = [];

btnExportarPDF.addEventListener("click", () => {
    console.log("Clicou no PDF");

    gerarPDF();
});

tituloGrupo.textContent =
    "Gerenciar - " + grupo;

// Define a logo conforme o grupo
if (grupo === "Jovens") {
    logoGrupo.src = "image/logojovens.png";
} else if (grupo === "Banda") {
    logoGrupo.src = "image/logobanda.png";
} else if (grupo === "Orquestra") {
    logoGrupo.src = "image/logoorquestra.png";
} else if (grupo === "Coral") {
    logoGrupo.src = "image/logocoral.png";
} else if (grupo === "Adolescentes") {
    logoGrupo.src = "image/logoadolescentes.png";
} else if (grupo === "Irmãs") {
    logoGrupo.src = "image/logoirmas.png";
}
btnVoltar.addEventListener("click", () => {
    window.history.back();
});

btnAdicionar.addEventListener("click", () => {
    modalAdicionar.style.display = "flex";
});

btnCancelarAdicionar.addEventListener("click", () => {
    modalAdicionar.style.display = "none";
});

btnImportarNivers.addEventListener("click", () => {
    modalImportarNivers.style.display = "flex";
});

btnCancelarImportacao.addEventListener("click", () => {
    modalImportarNivers.style.display = "none";
});

btnVoltarPrevia.addEventListener("click", () => {

    areaPreviaImportacao.style.display = "none";

    areaTextoImportacao.style.display = "block";

});

btnConfirmarImportacao.addEventListener("click", async () => {

    if (niversParaImportar.length === 0) {
        return;
    }

    filaDuplicidades = [];
    niversNovosImportacao = [];

    for (const niver of niversParaImportar) {

        const resultadoDuplicidade =
            await verificarDuplicidade(
                niver.nome,
                niver.dia,
                niver.mes
            );

        if (resultadoDuplicidade.length === 0) {

            niversNovosImportacao.push(niver);

        } else {

            filaDuplicidades.push({
                niver: niver,
                pessoaDuplicada: resultadoDuplicidade[0]
            });
        }
    }

    if (filaDuplicidades.length > 0) {

        processarProximaDuplicidade();

    } else {

        await finalizarImportacao();

    }
});

async function processarProximaDuplicidade() {
    if (filaDuplicidades.length === 0) {

        await finalizarImportacao();

        return;
    }

    const item = filaDuplicidades[0];

    niverAtualImportacao = item;

    pessoaDuplicadaEncontrada =
        item.pessoaDuplicada;

    const grupos =
        pessoaDuplicadaEncontrada.grupos.join(", ");

    textoDuplicidade.innerHTML = `

        Encontramos:

        <strong>
            ${pessoaDuplicadaEncontrada.nome}
        </strong>
        <br><br>
        Esta pessoa já está nos grupos:
        <strong>
            ${grupos}
        </strong>
        <br><br>
        É a mesma pessoa?

    `;

    modalDuplicidade.style.display = "flex";
}

async function finalizarImportacao() {

    for (const niver of niversNovosImportacao) {

        await addDoc(
            collection(db, "aniversariantes"),
            {
                nome: niver.nome,
                dia: niver.dia,
                mes: niver.mes,
                grupos: [grupo]
            }
        );
    }

    mensagemSucesso.textContent =
        "🎉 Importação concluída!";

    mensagemSucesso.style.display = "block";

    setTimeout(() => {
        mensagemSucesso.style.display = "none";
        window.location.reload();
    }, 2000);
}

btnAnalisarNivers.addEventListener("click", () => {

    const texto =
        textoImportarNivers.value.trim();

    if (!texto) {

        mensagemAviso.textContent =
            "⚠️ Cole uma lista para importar!";

        mensagemAviso.style.display = "block";

        setTimeout(() => {

            mensagemAviso.style.display = "none";

        }, 3000);

        return;
    }

    const resultado =
        interpretarListaNivers(texto);

    const nivers =
        resultado.nivers;

    const linhasNaoIdentificadas =
        resultado.linhasNaoIdentificadas;

    if (nivers.length === 0) {

        mensagemAviso.textContent =
            "⚠️ Nenhum aniversariante foi encontrado!";

        mensagemAviso.style.display = "block";

        setTimeout(() => {

            mensagemAviso.style.display = "none";

        }, 3000);

        return;
    }

    niversParaImportar = nivers;

    tituloPreviaImportacao.textContent =
        `${nivers.length} Nivers encontrados:`;
    tituloPreviaImportacao.style.fontSize = "16px";

    listaPreviaImportacao.innerHTML = "";

    nivers.forEach((niver) => {

        const item =
            document.createElement("div");

        item.className =
            "item-previa-importacao";

        const dia =
            String(niver.dia).padStart(2, "0");

        const mes =
            String(niver.mes).padStart(2, "0");

        item.innerHTML = `
    <span>
        ${niver.nome}
    </span>

    <strong>
        ${dia}/${mes}
    </strong>
`;

        listaPreviaImportacao.appendChild(item);

    });

    /*
     * =====================================================
     * LINHAS NÃO IDENTIFICADAS
     * =====================================================
     */

    if (linhasNaoIdentificadas.length > 0) {

        const avisoNaoIdentificados =
            document.createElement("div");

        avisoNaoIdentificados.className =
            "linhas-nao-identificadas";

        avisoNaoIdentificados.innerHTML = `
            <h3 style="color: red; font-size: 16px; margin-top: 25px;">
                Essas datas não foram identificadas:
            </h3>
        `;

        linhasNaoIdentificadas.forEach((linha) => {

            const item =
                document.createElement("div");

            item.className =
                "linha-nao-identificada";

            item.textContent =
                linha;

            avisoNaoIdentificados.appendChild(item);

        });

        listaPreviaImportacao.appendChild(
            avisoNaoIdentificados
        );
    }

    areaTextoImportacao.style.display = "none";

    areaPreviaImportacao.style.display = "block";

});

function interpretarListaNivers(texto) {

    const linhas = texto.split(/\r?\n/);

    const meses = {
        janeiro: 1,
        fevereiro: 2,
        março: 3,
        marco: 3,
        abril: 4,
        maio: 5,
        junho: 6,
        julho: 7,
        agosto: 8,
        setembro: 9,
        outubro: 10,
        novembro: 11,
        dezembro: 12
    };

    const regexMeses =
        "janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro";

    let mesAtual = null;
    const nivers = [];
    const linhasNaoIdentificadas = [];

    linhas.forEach((linhaOriginal) => {

        let linha = linhaOriginal.trim();

        if (!linha) return;

        // Remove marcadores comuns
        linha = linha.replace(/^[-*]\s*/, "");
        linha = linha.replace(/^\[[ xX]\]\s*/, "");

        // Remove observações como 》Líder
        linha = linha.replace(/》.*$/g, "").trim();

        if (!linha) return;

        /*
         * =====================================================
         * 1. MÊS SOZINHO NA LINHA
         * =====================================================
         *
         * Exemplos:
         * Janeiro
         * - Janeiro
         * Janeiro:
         * - Janeiro:
         *
         * Define o mês atual para as linhas seguintes.
         */

        const textoMes = linha
            .replace(/^[-*]\s*/, "")
            .replace(/[:\-]+$/, "")
            .trim()
            .toLowerCase();

        if (meses[textoMes]) {
            mesAtual = meses[textoMes];
            return;
        }

        let resultado;

        /*
         * =====================================================
         * 2. DATA NUMÉRICA EXPLÍCITA
         * =====================================================
         *
         * Prioridade máxima.
         *
         * Exemplos:
         * Arnaldo 17/03
         * Arnaldo 17-03
         * Arnaldo 17.03
         *
         * 17/03 Arnaldo
         * 17-03 Arnaldo
         * 17.03 Arnaldo
         *
         * Também aceita espaços:
         * 17 / 03 Arnaldo
         */

        resultado = linha.match(
            /^(.+?)\s+(\d{1,2})\s*[\/\-.]\s*(\d{1,2})$/
        );

        if (resultado) {

            const nome = limparNome(resultado[1]);
            const dia = Number(resultado[2]);
            const mes = Number(resultado[3]);

            if (
                nome &&
                dia >= 1 &&
                dia <= 31 &&
                mes >= 1 &&
                mes <= 12
            ) {
                nivers.push({
                    nome,
                    dia,
                    mes
                });
            }

            return;
        }

        resultado = linha.match(
            /^(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s+(.+)$/
        );

        if (resultado) {

            const dia = Number(resultado[1]);
            const mes = Number(resultado[2]);
            const nome = limparNome(resultado[3]);

            if (
                nome &&
                dia >= 1 &&
                dia <= 31 &&
                mes >= 1 &&
                mes <= 12
            ) {
                nivers.push({
                    nome,
                    dia,
                    mes
                });
            }

            return;
        }

        /*
         * =====================================================
         * 3. MÊS ESCRITO JUNTO DA DATA
         * =====================================================
         *
         * Exemplos:
         * Arnaldo 17 de março
         * 17 de março Arnaldo
         * Arnaldo março 17
         */

        resultado = linha.match(
            new RegExp(
                "^(.+?)\\s+(\\d{1,2})\\s+de\\s+(" +
                regexMeses +
                ")$",
                "i"
            )
        );

        if (resultado) {

            const nome = limparNome(resultado[1]);
            const dia = Number(resultado[2]);
            const mes = meses[resultado[3].toLowerCase()];

            if (
                nome &&
                dia >= 1 &&
                dia <= 31 &&
                mes
            ) {
                nivers.push({
                    nome,
                    dia,
                    mes
                });
            }

            return;
        }

        resultado = linha.match(
            new RegExp(
                "^(\\d{1,2})\\s+de\\s+(" +
                regexMeses +
                ")\\s*[-–—]?\\s*(.+)$",
                "i"
            )
        );

        if (resultado) {

            const dia = Number(resultado[1]);
            const mes = meses[resultado[2].toLowerCase()];
            const nome = limparNome(resultado[3]);

            if (
                nome &&
                dia >= 1 &&
                dia <= 31 &&
                mes
            ) {
                nivers.push({
                    nome,
                    dia,
                    mes
                });
            }

            return;
        }

        resultado = linha.match(
            new RegExp(
                "^(.+?)\\s+(" +
                regexMeses +
                ")\\s+(\\d{1,2})$",
                "i"
            )
        );

        if (resultado) {

            const nome = limparNome(resultado[1]);
            const mes = meses[resultado[2].toLowerCase()];
            const dia = Number(resultado[3]);

            if (
                nome &&
                dia >= 1 &&
                dia <= 31 &&
                mes
            ) {
                nivers.push({
                    nome,
                    dia,
                    mes
                });
            }

            return;
        }

        /*
         * =====================================================
         * 4. DIA + NOME USANDO O MÊS DO CABEÇALHO
         * =====================================================
         *
         * Exemplos:
         *
         * 17 Arnaldo
         * 17. Arnaldo
         * 17 - Arnaldo
         * 17. - Arnaldo
         *
         * Arnaldo 17
         * Arnaldo 17.
         * Arnaldo - 17
         * Arnaldo - 17.
         */

        if (mesAtual) {

            resultado = linha.match(
                /^(\d{1,2})\s*\.?\s*(?:-\s*)?(.+)$/
            );

            if (resultado) {

                const dia = Number(resultado[1]);
                const nome = limparNome(resultado[2]);

                if (
                    dia >= 1 &&
                    dia <= 31 &&
                    nome
                ) {
                    nivers.push({
                        nome,
                        dia,
                        mes: mesAtual
                    });

                    return;
                }
            }

            resultado = linha.match(
                /^(.+?)\s*(?:-\s*)?(\d{1,2})\.?$/
            );

            if (resultado) {

                const nome = limparNome(resultado[1]);
                const dia = Number(resultado[2]);

                if (
                    nome &&
                    dia >= 1 &&
                    dia <= 31
                ) {
                    nivers.push({
                        nome,
                        dia,
                        mes: mesAtual
                    });

                    return;
                }
            }
        }

        /*
         * =====================================================
         * 5. LINHA NÃO RECONHECIDA
         * =====================================================
         *
         * Não faz nada.
         * A linha simplesmente não será importada.
         */
        linhasNaoIdentificadas.push(linhaOriginal.trim());

    });

    return {
        nivers,
        linhasNaoIdentificadas
    };
}

function limparNome(nome) {

    return nome
        .replace(/\([^)]*\)/g, "")
        .replace(/[*]+/g, "")
        .replace(/》.*$/g, "")
        .trim();

}

async function verificarDuplicidade(nome, dia, mes) {
    const resultado = await getDocs(
        collection(db, "aniversariantes")
    );

    const encontrados = [];

    const primeiroNomeCadastro =
        nome.trim().toLowerCase().split(" ")[0];

    resultado.forEach((documento) => {
        const pessoa = documento.data();

        const primeiroNomeBanco =
            pessoa.nome.trim().toLowerCase().split(" ")[0];

        if (
            pessoa.dia === dia &&
            pessoa.mes === mes &&
            primeiroNomeBanco === primeiroNomeCadastro
        ) {
            encontrados.push({
                id: documento.id,
                nome: pessoa.nome,
                grupos: pessoa.grupos
            });
        }
    });

    return encontrados;
}
// FUNÇÃO DE TESTE DE DUPLICIDADE
btnSalvarAdicionar.addEventListener("click", async () => {
    const nome =
        document.getElementById("nomeAdicionar").value.trim();
    const dia =
        Number(document.getElementById("diaAdicionar").value);
    const mes =
        Number(document.getElementById("mesAdicionar").value);

    if (!nome || !dia || !mes) {
        mensagemAviso.style.display = "block";
        setTimeout(() => {
            mensagemAviso.style.display = "none";
        }, 3000);
        return;
    }

    const resultadoDuplicidade =
        await verificarDuplicidade(nome, dia, mes);
    console.log(resultadoDuplicidade);

    if (resultadoDuplicidade.length > 0) {
        pessoaDuplicadaEncontrada =
            resultadoDuplicidade[0];

        const grupos =
            pessoaDuplicadaEncontrada.grupos.join(", ");

        textoDuplicidade.innerHTML = `

        Encontramos:

        <strong>
            ${pessoaDuplicadaEncontrada.nome}
        </strong>
        <br><br>
        Esta pessoa já está nos grupos:
        <strong>
            ${grupos}
        </strong>
        <br><br>
        É a mesma pessoa?

    `;

        modalDuplicidade.style.display = "flex";
        return;
    }

    await addDoc(
        collection(db, "aniversariantes"),
        {
            nome: nome,
            dia: dia,
            mes: mes,
            grupos: [
                grupo
            ]
        }
    );

    mensagemSucesso.textContent =
        "🎉 Adicionado com sucesso!";
    mensagemSucesso.className =
        "mensagem-sucesso mensagem-adicionado";
    mensagemSucesso.style.display = "block";

    setTimeout(() => {
        mensagemSucesso.style.display = "none";
    }, 3000);
    modalAdicionar.style.display = "none";

    // limpa os campos
    document.getElementById("nomeAdicionar").value = "";
    document.getElementById("diaAdicionar").value = "";
    document.getElementById("mesAdicionar").value = "";
    // recarrega somente a lista
    listaAniversariantes.innerHTML = "";

    carregarAniversariantes(nome);
});

async function carregarAniversariantes(nomeNovo = "") {
    document.getElementById("carregando").style.display = "block";
    listaAniversariantes.innerHTML = "";

    const aniversariantesRef =
        collection(db, "aniversariantes");
    const resultado =
        await getDocs(aniversariantesRef);

    listaAtualAniversariantes = [];

    resultado.forEach((documento) => {
        const aniversario =
            documento.data();

        const idAniversario =
            documento.id;

        // verifica se pertence ao grupo
        if (!aniversario.grupos.includes(grupo)) {
            return;
        }
        listaAtualAniversariantes.push({
            id: documento.id,
            ...aniversario
        });

        const card =
            criarCard(
                aniversario,
                idAniversario
            );

        listaAniversariantes.appendChild(card);
    });
    listaExibidaAtual = [...listaAtualAniversariantes];

    document.getElementById("carregando").style.display = "none";

    // Inicia a rolagem automática quando a lista estiver pronta
    iniciarRolagemAutomatica();
}
btnCancelarEditar.addEventListener("click", () => {

    modalEditar.style.display = "none";
    pessoaEditando = null;

});

btnSalvarEditar.addEventListener("click", async () => {
    const novoNome =
        document.getElementById("nomeEditar").value.trim();

    const novoDia =
        Number(document.getElementById("diaEditar").value);

    const novoMes =
        Number(document.getElementById("mesEditar").value);

    if (!novoNome || !novoDia || !novoMes) {

        mensagemAviso.textContent =
            "⚠️ Preencha todos os campos!";

        mensagemAviso.style.display = "block";

        setTimeout(() => {
            mensagemAviso.style.display = "none";
        }, 3000);

        return;
    }

    await updateDoc(
        doc(
            db,
            "aniversariantes",
            pessoaEditando.id
        ),
        {
            nome: novoNome,
            dia: novoDia,
            mes: novoMes
        }
    );

    modalEditar.style.display = "none";
    mensagemSucesso.textContent =
        "🎉 Alterado com sucesso!";
    mensagemSucesso.className = "mensagem-sucesso mensagem-editado";
    mensagemSucesso.style.display = "block";

    setTimeout(() => {
        mensagemSucesso.style.display = "none";
    }, 3000);

    listaAniversariantes.innerHTML = "";
    carregarAniversariantes();
});
btnCancelarDuplicidade.addEventListener("click", () => {

    filaDuplicidades.shift();

    modalDuplicidade.style.display = "none";

    processarProximaDuplicidade();
});

btnAdicionarGrupo.addEventListener("click", async () => {

    if (!pessoaDuplicadaEncontrada) {
        return;
    }

    const gruposAtuais =
        pessoaDuplicadaEncontrada.grupos || [];

    if (gruposAtuais.includes(grupo)) {

        mensagemAviso.textContent =
            "⚠️ Esta pessoa já está neste grupo!";

        mensagemAviso.style.display = "block";

        setTimeout(() => {
            mensagemAviso.style.display = "none";
        }, 3000);

    } else {

        const novosGrupos = [
            ...gruposAtuais,
            grupo
        ];

        await updateDoc(
            doc(
                db,
                "aniversariantes",
                pessoaDuplicadaEncontrada.id
            ),
            {
                grupos: novosGrupos
            }
        );

        mensagemSucesso.textContent =
            "🎉 Adicionado ao grupo!";

        mensagemSucesso.className =
            "mensagem-sucesso mensagem-adicionado";

        mensagemSucesso.style.display = "block";

        setTimeout(() => {
            mensagemSucesso.style.display = "none";
        }, 2000);
    }

    filaDuplicidades.shift();
    modalDuplicidade.style.display = "none";

    processarProximaDuplicidade();
});

btnNovaPessoa.addEventListener("click", async () => {

    if (!niverAtualImportacao) {
        return;
    }

    const niver =
        niverAtualImportacao.niver;

    await addDoc(
        collection(db, "aniversariantes"),
        {
            nome: niver.nome,
            dia: niver.dia,
            mes: niver.mes,
            grupos: [grupo]
        }
    );

    mensagemSucesso.textContent =
        "🎉 Cadastrado como nova pessoa!";

    mensagemSucesso.className =
        "mensagem-sucesso mensagem-adicionado";

    mensagemSucesso.style.display = "block";

    setTimeout(() => {
        mensagemSucesso.style.display = "none";
    }, 2000);

    filaDuplicidades.shift();
    modalDuplicidade.style.display = "none";

    processarProximaDuplicidade();
});

function renderizarLista(lista) {

    listaExibidaAtual = lista;

    listaAniversariantes.innerHTML = "";

    lista.forEach((aniversario) => {
        const card =
            criarCard(
                aniversario,
                aniversario.id
            );

        listaAniversariantes.appendChild(card);
    });
}
pesquisaAniversariante.addEventListener("input", () => {

    const texto =
        pesquisaAniversariante.value
            .toLowerCase();

    const filtrados =
        listaAtualAniversariantes.filter(
            pessoa =>
                pessoa.nome
                    .toLowerCase()
                    .includes(texto)
        );

    renderizarLista(filtrados);
});

btnOrdenarNome.addEventListener("click", () => {

    // Para a rolagem automática
    clearInterval(rolagemAutomatica);
    rolagemAutomatica = null;

    // Volta a lista para o topo
    listaAniversariantes.scrollTop = 0;

    btnOrdenarNome.classList.add(
        "botao-selecionado"
    );

    btnOrdenarData.classList.remove(
        "botao-selecionado"
    );


    const listaOrdenada =
        [...listaAtualAniversariantes];

    listaOrdenada.sort((a, b) =>
        a.nome.localeCompare(b.nome)
    );

    renderizarLista(listaOrdenada);
});

btnOrdenarData.addEventListener("click", () => {

    // Para a rolagem automática
    clearInterval(rolagemAutomatica);
    rolagemAutomatica = null;

    // Volta a lista para o topo
    listaAniversariantes.scrollTop = 0;

    btnOrdenarData.classList.add(
        "botao-selecionado"
    );
    btnOrdenarNome.classList.remove(
        "botao-selecionado"
    );


    const listaOrdenada =
        [...listaAtualAniversariantes];

    listaOrdenada.sort((a, b) => {

        const dataA =
            a.mes * 100 + a.dia;

        const dataB =
            b.mes * 100 + b.dia;

        return dataA - dataB;
    });
    renderizarLista(listaOrdenada);
});

btnOrdenarNomeExpandido.addEventListener("click", () => {
    btnOrdenarNome.click();

    btnOrdenarNomeExpandido.classList.add("botao-selecionado");
    btnOrdenarDataExpandido.classList.remove("botao-selecionado");
});

btnOrdenarDataExpandido.addEventListener("click", () => {
    btnOrdenarData.click();

    btnOrdenarDataExpandido.classList.add("botao-selecionado");
    btnOrdenarNomeExpandido.classList.remove("botao-selecionado");
});

function criarCard(aniversario, idAniversario) {

    const card =
        document.createElement("div");
    card.className =
        "card-aniversario";
    const dia =
        String(aniversario.dia)
            .padStart(2, "0");
    const mes =
        String(aniversario.mes)
            .padStart(2, "0");

    card.innerHTML = `

        <div class="dados-aniversariante">
            <strong>
                ${aniversario.nome}
            </strong>

            <span>
                ${dia}/${mes}
            </span>
        </div>

        <div class="acoes-aniversariante">
            <button class="btnEditar">
                Editar
            </button>

            <button class="btnExcluir">
                Excluir
            </button>
        </div>

    `;

    const btnExcluir =
        card.querySelector(".btnExcluir");
    const btnEditar =
        card.querySelector(".btnEditar");

    btnEditar.addEventListener("click", () => {
        pessoaEditando = {
            id: idAniversario,
            nome: aniversario.nome,
            dia: aniversario.dia,
            mes: aniversario.mes
        };

        document.getElementById("nomeEditar").value =
            aniversario.nome;
        document.getElementById("diaEditar").value =
            aniversario.dia;
        document.getElementById("mesEditar").value =
            aniversario.mes;
        modalEditar.style.display = "flex";

    });

    btnExcluir.addEventListener("click", () => {
        pessoaExcluindo = {
            aniversario,
            idAniversario,
            card
        };
        textoExcluir.innerHTML =
            `
        Deseja realmente excluir:

        <strong>
            ${aniversario.nome}
        </strong>
        ?
        `;
        modalExcluir.style.display = "flex";
    });

    return card;
}

btnCancelarExcluir.addEventListener("click", () => {
    modalExcluir.style.display = "none";
    pessoaExcluindo = null;
});

btnConfirmarExcluir.addEventListener("click", async () => {

    const aniversario =
        pessoaExcluindo.aniversario;
    const idAniversario =
        pessoaExcluindo.idAniversario;
    const card =
        pessoaExcluindo.card;
    const novoArrayGrupos =
        aniversario.grupos.filter(
            (item) => item !== grupo
        );

    if (novoArrayGrupos.length === 0) {
        await deleteDoc(
            doc(
                db,
                "aniversariantes",
                idAniversario
            )
        );

    } else {
        await updateDoc(
            doc(
                db,
                "aniversariantes",
                idAniversario
            ),
            {
                grupos:
                    novoArrayGrupos
            }
        );
    }

    card.remove();
    modalExcluir.style.display = "none";
    mensagemSucesso.textContent =
        "🗑️ Excluído com sucesso!";

    mensagemSucesso.className = "mensagem-sucesso mensagem-excluido";
    mensagemSucesso.style.display =
        "block";

    setTimeout(() => {

        mensagemSucesso.style.display =
            "none";

    }, 3000);
});

function gerarPDF() {

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const margemEsquerda = 20;
    const margemDireita = 110;
    const yInicial = 50;
    const espacamento = 10;

    // Margem de segurança na parte inferior da folha.
    const margemInferior = 30;

    // Altura útil da página A4.
    const alturaPagina = pdf.internal.pageSize.getHeight();

    // Calcula quantos nomes cabem com segurança em cada coluna.
    const alturaDisponivel =
        alturaPagina - yInicial - margemInferior;

    const quantidadePorColuna =
        Math.floor(alturaDisponivel / espacamento);

    // Duas colunas por página.
    const quantidadePorPagina =
        quantidadePorColuna * 2;

    // Mantém exatamente a lista exibida na tela,
    // respeitando pesquisa e ordenação.
    const lista = listaExibidaAtual;

    // Caso não existam pessoas na lista.
    if (lista.length === 0) {

        pdf.setFontSize(18);
        pdf.text("NIVERS", 20, 20);

        pdf.setFontSize(14);
        pdf.text(
            "Grupo: " + grupo,
            20,
            35
        );

        pdf.save(
            `Nivers-${grupo}.pdf`
        );

        return;
    }

    // Percorre a lista página por página.
    for (
        let inicio = 0;
        inicio < lista.length;
        inicio += quantidadePorPagina
    ) {

        // Nova página somente quando necessário.
        if (inicio > 0) {
            pdf.addPage();
        }

        // Cabeçalho.
        pdf.setFontSize(18);
        pdf.text("NIVERS", 20, 20);

        pdf.setFontSize(14);
        pdf.text(
            "Grupo: " + grupo,
            20,
            35
        );

        // Pessoas que pertencem a esta página.
        const pessoasPagina =
            lista.slice(
                inicio,
                inicio + quantidadePorPagina
            );

        // Divide entre as duas colunas.
        const metade =
            Math.ceil(pessoasPagina.length / 2);

        const colunaEsquerda =
            pessoasPagina.slice(0, metade);

        const colunaDireita =
            pessoasPagina.slice(metade);

        // Coluna esquerda.
        colunaEsquerda.forEach((pessoa, indice) => {

            pdf.setFontSize(12);
            pdf.text(
                `${pessoa.nome} - ${pessoa.dia}/${pessoa.mes}`,
                margemEsquerda,
                yInicial + (indice * espacamento)
            );
        });

        // Coluna direita.
        colunaDireita.forEach((pessoa, indice) => {

            pdf.setFontSize(12);

            pdf.text(
                `${pessoa.nome} - ${pessoa.dia}/${pessoa.mes}`,
                margemDireita,
                yInicial + (indice * espacamento)
            );
        });
    }

    pdf.save(
        `Nivers-${grupo}.pdf`
    );
}
carregarAniversariantes();

// =====================================================
// VISÃO MACRO
// =====================================================

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

btnVisaoMacro.addEventListener("click", () => {

    telaVisaoMacro.style.display = "block";
    telaCalendarioMes.style.display = "none";

    renderizarVisaoMacro();

});


btnVoltarMacro.addEventListener("click", () => {

    telaVisaoMacro.style.display = "none";

    document.querySelector(".container").style.display = "block";

});


function renderizarVisaoMacro() {

    gradeMeses.innerHTML = "";

    subtituloMacro.textContent =
        `Aniversariantes do grupo ${grupo}`;

    nomesMeses.forEach((nomeMes, indice) => {

        const numeroMes = indice + 1;

        const quantidade =
            listaAtualAniversariantes.filter(
                aniversario =>
                    aniversario.mes === numeroMes
            ).length;

        const cardMes =
            document.createElement("button");

        cardMes.className = "card-macro-mes";

        cardMes.innerHTML = `
            <span class="nome-mes-macro">
                ${nomeMes}
            </span>

            <strong class="numero-mes-macro">
                ${quantidade}
            </strong>

            <span class="texto-nivers-macro">
                ${quantidade === 1 ? "aniversário" : "aniversários"}
            </span>
        `;

        cardMes.addEventListener("click", () => {

            abrirCalendarioMes(numeroMes);

        });

        gradeMeses.appendChild(cardMes);
    });
}

// =====================================================
// CALENDÁRIO MENSAL
// =====================================================

function abrirCalendarioMes(numeroMes) {

    telaVisaoMacro.style.display = "none";
    telaCalendarioMes.style.display = "flex";

    tituloMesCalendario.textContent =
        `📅 ${nomesMeses[numeroMes - 1]}`;

    renderizarCalendario(numeroMes);

}

btnVoltarMes.addEventListener("click", () => {

    telaCalendarioMes.style.display = "none";
    telaVisaoMacro.style.display = "block";

});


function renderizarCalendario(numeroMes) {

    gradeCalendario.innerHTML = "";

    const anoAtual =
        new Date().getFullYear();

    // Primeiro dia do mês
    const primeiroDia =
        new Date(
            anoAtual,
            numeroMes - 1,
            1
        ).getDay();

    // Quantidade de dias do mês
    const quantidadeDias =
        new Date(
            anoAtual,
            numeroMes,
            0
        ).getDate();

    // Espaços antes do primeiro dia
    for (
        let i = 0;
        i < primeiroDia;
        i++
    ) {

        const espaco =
            document.createElement("div");

        espaco.className =
            "dia-calendario vazio";

        gradeCalendario.appendChild(espaco);
    }


    // Cria cada dia
    for (
        let dia = 1;
        dia <= quantidadeDias;
        dia++
    ) {

        const aniversariantesDoDia =
            listaAtualAniversariantes.filter(
                aniversario =>
                    aniversario.mes === numeroMes &&
                    aniversario.dia === dia
            );

        const celula =
            document.createElement("button");

        celula.className =
            "dia-calendario";


        // Número do dia
        const numero =
            document.createElement("span");

        numero.className =
            "numero-dia";

        numero.textContent =
            dia;

        celula.appendChild(numero);


        // Se existem aniversariantes
        if (aniversariantesDoDia.length > 0) {

            celula.classList.add(
                "dia-com-aniversario"
            );

            const indicador =
                document.createElement("span");

            indicador.className =
                "indicador-aniversario";

            indicador.textContent =
                `🎂 ${aniversariantesDoDia.length}`;

            celula.appendChild(indicador);


            celula.addEventListener(
                "click",
                () => {

                    mostrarAniversariantesDoDia(
                        dia,
                        numeroMes,
                        aniversariantesDoDia
                    );

                }
            );

        } else {

            // Dia sem aniversário não precisa abrir nada
            celula.disabled = true;

        }

        gradeCalendario.appendChild(celula);
    }
}

// =====================================================
// MOSTRAR ANIVERSARIANTES DO DIA
// =====================================================

function mostrarAniversariantesDoDia(
    dia,
    numeroMes,
    aniversariantes
) {

    tituloDiaMacro.textContent =
        `🎂 ${dia} de ${nomesMeses[numeroMes - 1]}`;

    listaDiaMacro.innerHTML = "";

    aniversariantes.forEach(
        aniversario => {

            const item =
                document.createElement("div");

            item.className =
                "item-aniversariante-macro";

            item.innerHTML = `
                <span>🎂</span>
                <strong>
                    ${aniversario.nome}
                </strong>
            `;

            listaDiaMacro.appendChild(item);

        }
    );

    modalDiaMacro.style.display =
        "flex";

}

btnFecharDiaMacro.addEventListener(
    "click",
    () => {

        modalDiaMacro.style.display =
            "none";

    }
);

// =====================================================
// AJUSTE DA TELA AO ABRIR O TECLADO NO CELULAR
// =====================================================

const viewport = window.visualViewport;
const containerPrincipal = document.querySelector(".container");

let tecladoAberto = false;

if (viewport && containerPrincipal) {

    function ajustarTelaParaTeclado() {

        const alturaJanela = window.innerHeight;
        const alturaViewport = viewport.height;

        // Verifica se o teclado está aberto
        const diferenca = alturaJanela - alturaViewport;

        if (diferenca > 100 && document.activeElement === pesquisaAniversariante) {

            tecladoAberto = true;

            const campo = pesquisaAniversariante.getBoundingClientRect();

            // Quanto o campo precisa subir para ficar visível
            const limiteInferior = alturaViewport - 30;

            if (campo.bottom > limiteInferior) {

                const deslocamento =
                    limiteInferior - campo.bottom;

                containerPrincipal.style.transform =
                    `translateY(${deslocamento}px)`;
            }

        } else if (tecladoAberto) {

            // Teclado fechou → volta ao lugar original
            tecladoAberto = false;

            containerPrincipal.style.transform =
                "translateY(0)";
        }
    }

    // Detecta a abertura/fechamento do teclado
    viewport.addEventListener(
        "resize",
        ajustarTelaParaTeclado
    );

    // Quando entra na pesquisa
    pesquisaAniversariante.addEventListener(
        "focus",
        () => {

            setTimeout(() => {
                ajustarTelaParaTeclado();
            }, 300);

        }
    );

    // Quando sai da pesquisa
    pesquisaAniversariante.addEventListener(
        "blur",
        () => {

            setTimeout(() => {

                if (
                    document.activeElement !==
                    pesquisaAniversariante
                ) {
                    containerPrincipal.style.transform =
                        "translateY(0)";
                }

            }, 200);

        }
    );
}

// =====================================================
// ROLAGEM AUTOMÁTICA DA LISTA DE ANIVERSARIANTES
// =====================================================

let rolagemAutomatica = null;

function iniciarRolagemAutomatica() {

    const lista = document.getElementById("listaAniversariantes");

    if (!lista) return;

    // Para qualquer rolagem anterior
    clearInterval(rolagemAutomatica);

    // Começa sempre do topo
    lista.scrollTop = 0;

    rolagemAutomatica = setInterval(() => {

        // Se chegou ao final, volta para o topo
        if (
            lista.scrollTop + lista.clientHeight >=
            lista.scrollHeight - 1
        ) {
            lista.scrollTop = 0;
            return;
        }

        // Rolagem lenta
        lista.scrollTop += 1;

    }, 10);
}

// Para a rolagem automática quando o usuário interagir com a lista
const listaScroll = document.getElementById("listaAniversariantes");
const containerLista = document.querySelector(".lista-container-expandivel");
const btnExpandirLista = document.getElementById("btnExpandirLista");
const botoesOrdenacao = document.querySelector(".botoes-ordenacao");
const botoesExpansao = document.querySelector(".botoes-expansao");

if (containerLista && btnExpandirLista) {

    btnExpandirLista.addEventListener("click", () => {

        // Para a rolagem automática
        clearInterval(rolagemAutomatica);
        rolagemAutomatica = null;

        // Alterna entre normal e tela cheia
        const listaExpandida =
            containerLista.classList.toggle("lista-expandida");

        if (listaExpandida) {
            botoesExpansao.appendChild(btnExpandirLista);
        } else {
            botoesOrdenacao.appendChild(btnExpandirLista);
        }

        // Troca o ícone do botão
        if (containerLista.classList.contains("lista-expandida")) {

            btnExpandirLista.textContent = "Recolher lista";
            btnExpandirLista.title = "Recolher lista";

        } else {

            btnExpandirLista.textContent = "Expandir lista";
            btnExpandirLista.title = "Expandir lista";

        }

    });

}

if (listaScroll) {

    const pararRolagemAutomatica = () => {

        clearInterval(rolagemAutomatica);
        rolagemAutomatica = null;

    };

    // Toque na lista
    listaScroll.addEventListener(
        "touchstart",
        pararRolagemAutomatica,
        { passive: true }
    );

    // Clique em qualquer pessoa ou botão da lista
    listaScroll.addEventListener(
        "click",
        pararRolagemAutomatica
    );

    // Quando começar a arrastar com o mouse
    listaScroll.addEventListener(
        "mousedown",
        pararRolagemAutomatica
    );

    // Quando começar a interagir pelo ponteiro
    listaScroll.addEventListener(
        "pointerdown",
        pararRolagemAutomatica
    );
}
