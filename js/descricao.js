// 1. RECUPERA O SUPLEMENTO SELECIONADO NO LOCALSTORAGE
const produtoTexto = localStorage.getItem("produtoSelecionado");
let produtoAtual = JSON.parse(produtoTexto);

if (!produtoAtual) {
    produtoAtual = {
        id: 1,
        nome: "100% Whey Protein Concentrado (900g)",
        categoria: "Proteínas",
        preco: 119.90,
        imagem: "https://via.placeholder.com/350x350/1e1e1e/ffffff?text=Titan+Whey+900g",
        sabores: ["Chocolate", "Baunilha", "Morango", "Cookies & Cream"],
        descricao: "24g de proteína por dose, rico em BCAAs e glutamina. Ideal para recuperação e ganho de massa muscular pós-treino.",
        modoUso: "Diluir 2 dosadores (30g) em 200ml de água gelada ou leite logo após o treino."
    };
}

document.querySelector("#prod-imagem").src = produtoAtual.imagem;
document.querySelector("#prod-imagem").alt = produtoAtual.nome;
document.querySelector("#prod-categoria").innerText = produtoAtual.categoria;
document.querySelector("#prod-nome").innerText = produtoAtual.nome;
document.querySelector("#prod-preco").innerText = "R$ " + produtoAtual.preco.toFixed(2).replace(".", ",");
document.querySelector("#prod-descricao").innerText = produtoAtual.descricao;
document.querySelector("#prod-uso").innerText = produtoAtual.modoUso;

const selectSabor = document.querySelector("#select-sabor");
const listaSabores = produtoAtual.sabores || ["Padrão"];

listaSabores.forEach(function(sabor) {
    const opcao = document.createElement("option");
    opcao.value = sabor;
    opcao.innerText = sabor;
    selectSabor.appendChild(opcao);
});

const btnAdicionar = document.querySelector("#btn-adicionar");

btnAdicionar.addEventListener("click", function() {
    const quantidade = parseInt(document.querySelector("#prod-qtd").value);
    const saborEscolhido = document.querySelector("#select-sabor").value;

    if (isNaN(quantidade) || quantidade < 1) {
        mostrarMensagem("Informe uma quantidade válida (mínimo 1).", "erro");
        return;
    }

    const carrinhoTexto = localStorage.getItem("carrinho");
    let carrinho = carrinhoTexto ? JSON.parse(carrinhoTexto) : [];

    let achou = false;
    for (let i = 0; i < carrinho.length; i++) {
        if (carrinho[i].id === produtoAtual.id && carrinho[i].sabor === saborEscolhido) {
            carrinho[i].quantidade += quantidade;
            achou = true;
        }
    }

    if (!achou) {
        carrinho.push({
            id: produtoAtual.id,
            nome: produtoAtual.nome,
            sabor: saborEscolhido,
            preco: produtoAtual.preco,
            imagem: produtoAtual.imagem,
            quantidade: quantidade
        });
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    mostrarMensagem("Adicionado ao carrinho: " + quantidade + "x " + produtoAtual.nome + " (" + saborEscolhido + ")", "sucesso");
    atualizarContador();
});

function mostrarMensagem(texto, tipo) {
    const msg = document.querySelector("#mensagem-feedback");
    msg.innerText = texto;
    msg.classList.remove("oculto", "sucesso", "erro");
    msg.classList.add(tipo);
}

function atualizarContador() {
    const carrinhoTexto = localStorage.getItem("carrinho");
    const carrinho = carrinhoTexto ? JSON.parse(carrinhoTexto) : [];

    const total = carrinho.reduce(function(acumulador, item) {
        return acumulador + item.quantidade;
    }, 0);

    document.querySelector("#contador-carrinho").innerText = total;
}

atualizarContador();