const CART_KEY = "titansupps_carrinho";
const LEGACY_CART_KEY = "carrinho";
let produtoAtual;

// Pega o id que veio no endereço: descricao_prod.html?id=creatina-evogen
const idDaUrl = new URLSearchParams(window.location.search).get("id");

// Procura o produto no produtos.json e preenche a página
async function carregarProduto() {
    try {
        const resposta = await fetch("../../produtos.json");
        const produtos = await resposta.json();

        if (idDaUrl) {
            produtoAtual = produtos.find(produto => produto.id === idDaUrl);
        } else {
            // Abriu pelo menu (sem id): mostra o primeiro produto da lista
            produtoAtual = produtos[0];
        }
    } catch (erro) {
        console.error("Não foi possível carregar o produtos.json", erro);
    }

    if (!produtoAtual) {
        mostrarProdutoNaoEncontrado();
        return;
    }

    preencherPagina();
}

function preencherPagina() {
    document.title = produtoAtual.name + " - Titan Suplementos";
    
    document.querySelector("#prod-imagem").src = produtoAtual.image;
    document.querySelector("#prod-imagem").alt = produtoAtual.imageAlt || produtoAtual.name;
    document.querySelector("#prod-categoria").innerText = produtoAtual.category;
    document.querySelector("#prod-tag").innerText = produtoAtual.tag;
    document.querySelector("#prod-marca").innerText = produtoAtual.brand + " • " + produtoAtual.size;
    document.querySelector("#prod-nome").innerText = produtoAtual.name;
    document.querySelector("#prod-preco").innerText = "R$ " + produtoAtual.price.toFixed(2).replace(".", ",");
    document.querySelector("#prod-resumo").innerText = produtoAtual.shortDescription;
    document.querySelector("#prod-descricao").innerText = produtoAtual.description;

    if (produtoAtual.oldPrice) {
        const elPrecoAntigo = document.querySelector("#prod-preco-antigo");
        elPrecoAntigo.innerText = "De: R$ " + produtoAtual.oldPrice.toFixed(2).replace(".", ",");
        elPrecoAntigo.classList.remove("oculto");
    }
}


// Id que não existe no JSON (ou JSON que não carregou)
function mostrarProdutoNaoEncontrado() {
    document.querySelector("#prod-nome").innerText = "Produto não encontrado";
    document.querySelector("#prod-resumo").innerText = "Volte para a lista de produtos e escolha um item.";

    // Esconde o que não faz sentido sem produto
    const esconder = [".produto-imagem-box", ".tags-linha", "#prod-marca", ".bloco-precos", ".box-descricao", ".campo", "#btn-adicionar"];

    esconder.forEach(seletor => {
        document.querySelector(seletor).classList.add("oculto");
    });
}

const btnAdicionar = document.querySelector("#btn-adicionar");

btnAdicionar.addEventListener("click", function() {
    const quantidade = parseInt(document.querySelector("#prod-qtd").value);

    if (isNaN(quantidade) || quantidade < 1) {
        mostrarMensagem("Informe uma quantidade válida (mínimo 1).", "erro");
        return;
    }

    const carrinho = lerCarrinho();
    const itemExistente = carrinho.find(item => item.id === produtoAtual.id);
    if (itemExistente) itemExistente.quantity += quantidade;
    else carrinho.push({ id: produtoAtual.id, quantity: quantidade });

    localStorage.setItem(CART_KEY, JSON.stringify(carrinho));

    mostrarMensagem("Adicionado ao carrinho: " + quantidade + "x " + produtoAtual.name, "sucesso");
    atualizarContador();
});

function mostrarMensagem(texto, tipo) {
    const msg = document.querySelector("#mensagem-feedback");
    msg.innerText = texto;
    msg.classList.remove("oculto", "sucesso", "erro");
    msg.classList.add(tipo);
}

function atualizarContador() {
    const contador = document.querySelector("#cart-count");
    if (!contador) return;
    const total = lerCarrinho().reduce((acumulador, item) => acumulador + item.quantity, 0);
    contador.innerText = total;
}

function lerCarrinho() {
    try {
        const salvo = localStorage.getItem(CART_KEY);
        const itensAtuais = salvo === null ? [] : JSON.parse(salvo);
        const legadoSalvo = localStorage.getItem(LEGACY_CART_KEY);
        if (legadoSalvo !== null) {
            const legado = JSON.parse(legadoSalvo);
            const itensLegados = Array.isArray(legado) ? legado : [];
            const convertido = [...(Array.isArray(itensAtuais) ? itensAtuais : []), ...itensLegados]
                .filter(item => item && typeof item.id === "string" && Number(item.quantity ?? item.quantidade) > 0)
                .map(item => ({ id: item.id, quantity: Math.floor(Number(item.quantity ?? item.quantidade)) }));
            localStorage.setItem(CART_KEY, JSON.stringify(convertido));
            localStorage.removeItem(LEGACY_CART_KEY);
            return convertido;
        }
        return Array.isArray(itensAtuais) ? itensAtuais
            .filter(item => item && typeof item.id === "string" && Number(item.quantity) > 0)
            .map(item => ({ id: item.id, quantity: Math.floor(Number(item.quantity)) })) : [];
    } catch {
        return [];
    }
}

function atualizarUsuarioNav() {
    const navUsuario = document.querySelector("#nav-usuario");
    if (!navUsuario) return;
    try {
        const usuario = JSON.parse(localStorage.getItem("usuario_logado") || "null");
        navUsuario.textContent = usuario?.nome ? "Olá, " + usuario.nome.trim().split(/\s+/)[0] : "Entrar";
    } catch {
        navUsuario.textContent = "Entrar";
    }
}

window.addEventListener("storage", evento => {
    if (evento.key === CART_KEY || evento.key === LEGACY_CART_KEY) atualizarContador();
    if (evento.key === "usuario_logado") atualizarUsuarioNav();
});

atualizarContador();
atualizarUsuarioNav();
carregarProduto();
