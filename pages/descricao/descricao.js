const CART_KEY = "titansupps_carrinho";
const LEGACY_CART_KEY = "carrinho";
let produtoAtual;
try {
    produtoAtual = JSON.parse(localStorage.getItem("produtoSelecionado") || "null");
} catch {
    produtoAtual = null;
}


if (!produtoAtual) {
    produtoAtual = {
        id: "whey-isolate",
        name: "Whey Isolate Chocolate",
        brand: "Protein Project",
        category: "Proteínas",
        size: "900 g",
        price: 189.9,
        oldPrice: 219.9,
        tag: "Destaque",
        shortDescription: "Proteína em pó sabor chocolate para complementar sua rotina alimentar.",
        description: "Uma opção prática para incluir proteína na rotina. O produto de referência traz sabor chocolate e embalagem de 900 g. Confira sempre a embalagem e as informações do fabricante.",
        image: "https://proteinproject.co/cdn/shop/files/WheyProteinIsolate_chocolate_2lb.png?v=1720122109",
        imageAlt: "Embalagem de whey isolate sabor chocolate"
    };
}


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
