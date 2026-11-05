const admin = require("firebase-admin");
const { onSchedule } = require("firebase-functions/v2/scheduler");

admin.initializeApp();

async function enviarNotificacoes() {

    const agora = new Date();

    const hoje = new Date(
        agora.toLocaleString(
            "en-US",
            {
                timeZone: "America/Sao_Paulo"
            }
        )
    );

    const dia = hoje.getDate();
    const mes = hoje.getMonth() + 1;


    console.log(
        `Data considerada no Brasil: ${dia}/${mes}`
    );

    console.log(
        `Procurando aniversariantes ${dia}/${mes}`
    );


    const aniversariantesSnapshot =
        await admin.firestore()
            .collection("aniversariantes")
            .where("dia", "==", dia)
            .where("mes", "==", mes)
            .get();


    if (aniversariantesSnapshot.empty) {

        console.log("Nenhum aniversariante hoje");
        return 0;
    }

    let enviados = 0;

    for (const aniversarioDoc of aniversariantesSnapshot.docs) {

        const aniversariante = aniversarioDoc.data();
        for (const grupo of aniversariante.grupos) {

            const usuariosSnapshot =
                await admin.firestore()
                    .collection("usuarios")
                    .where(
                        "grupos",
                        "array-contains",
                        grupo
                    )
                    .get();

            const tokensPorToken = new Map();

            usuariosSnapshot.forEach((usuarioDoc) => {

                const usuario = usuarioDoc.data();

                if (Array.isArray(usuario.tokens)) {
                    usuario.tokens.forEach((token) => {
                        if (!token) return;

                        if (!tokensPorToken.has(token)) {
                            tokensPorToken.set(token, new Set());
                        }

                        tokensPorToken.get(token).add(usuarioDoc.id);
                    });
                }

            });

            const tokens = [...tokensPorToken.keys()];

            if (tokens.length === 0) {
                continue;
            }

            for (let inicio = 0; inicio < tokens.length; inicio += 500) {
                const loteTokens = tokens.slice(inicio, inicio + 500);
                const mensagem = {
                    notification: {
                        title: "🎂 Aniversário Hoje!",
                        body: `${aniversariante.nome} está fazendo aniversário no grupo ${grupo}!`
                    },
                    tokens: loteTokens
                };

                const resposta = await admin.messaging()
                    .sendEachForMulticast(mensagem);

                enviados += resposta.successCount;

                const tokensInvalidosPorUsuario = new Map();

                resposta.responses.forEach((resultado, indice) => {
                    if (resultado.success) return;

                    const codigoErro = resultado.error?.code;
                    if (
                        codigoErro !== "messaging/registration-token-not-registered" &&
                        codigoErro !== "messaging/invalid-registration-token"
                    ) {
                        return;
                    }

                    const token = loteTokens[indice];
                    const usuariosDoToken = tokensPorToken.get(token) || [];

                    usuariosDoToken.forEach((usuarioId) => {
                        if (!tokensInvalidosPorUsuario.has(usuarioId)) {
                            tokensInvalidosPorUsuario.set(usuarioId, new Set());
                        }
                        tokensInvalidosPorUsuario.get(usuarioId).add(token);
                    });
                });

                await Promise.all(
                    [...tokensInvalidosPorUsuario.entries()].map(
                        ([usuarioId, tokensInvalidos]) =>
                            admin.firestore()
                                .collection("usuarios")
                                .doc(usuarioId)
                                .update({
                                    tokens: admin.firestore.FieldValue.arrayRemove(
                                        ...tokensInvalidos
                                    )
                                })
                    )
                );

                const removidos = [...tokensInvalidosPorUsuario.values()]
                    .reduce((total, tokensDoUsuario) => total + tokensDoUsuario.size, 0);

                console.log(
                    `${resposta.successCount} enviados para ${grupo}; ` +
                    `${removidos} tokens inválidos removidos`
                );
            }
        }
    }
    return enviados;
}

exports.enviarAniversarios = onSchedule(
    {
        schedule: "0 5,12,15 * * *",
        timeZone: "America/Sao_Paulo",
    },
    async () => {

        await enviarNotificacoes();
    }
);

