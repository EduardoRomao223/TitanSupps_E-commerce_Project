// Variáveis Padrão
const ARQUIVO_PRODUTOS = '/produtos.json'         // JSON na raiz do projeto
const CHAVE_CARRINHO = 'titansupps_carrinho'       // mesma chave usada pela página inicial
const FRETE_GRATIS = 299
const FRETE = 19.9

const CUPONS = {
    TITAN10: 0.10,
    FORCA15: 0.15
};

// Lista de produtos (preenchida com o conteúdo do JSON)
let produtos = []

// Itens do carrinho (preenchida no iniciar())
let carrinho = []

let cupomAtual = localStorage.getItem('cupom')

if (!CUPONS[cupomAtual]) {
    cupomAtual = null
}


// Lê o que a página inicial salvou ([{ id, quantity }]) e completa
// com nome, preço, categoria e imagem que estão no JSON
function lerCarrinho() {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || []
    const lista = []

    for (let i = 0; i < salvo.length; i++) {
        const produto = produtos.find(function(p) {
            return p.id === salvo[i].id
        })

        // Produto que não existe mais no JSON é ignorado
        if (produto) {
            lista.push({
                id: produto.id,
                nome: produto.name,
                cat: produto.category,
                preco: produto.price,
                img: produto.image,
                qtd: Number(salvo[i].quantity) || 1
            })
        }
    }

    return lista
}


// Salvar dados
function salvar() {
    const paraSalvar = []

    // Só guarda id e quantity (o resto vem do JSON), igual à página inicial
    for (let i = 0; i < carrinho.length; i++) {
        paraSalvar.push({ id: carrinho[i].id, quantity: carrinho[i].qtd })
    }

    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(paraSalvar))
    desenhar()
}


//Funções auxiliares
function formatar(valor) {
    valor = Number(valor) || 0

    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function mostrarAviso(texto) {
    const aviso = document.createElement('div')

    aviso.className = 'aviso'
    aviso.textContent = texto

    document.body.appendChild(aviso)

    setTimeout(function() {
        aviso.remove()
    }, 2200)
}


//Calcular valores
function calcularTotais() {
    let subtotal = 0

    for (let i = 0; i < carrinho.length; i++) {
        subtotal += carrinho[i].preco * carrinho[i].qtd
    }

    let desconto = 0

    if (cupomAtual) {
        desconto = subtotal * CUPONS[cupomAtual]
    }

    let base = subtotal - desconto
    let frete = FRETE

    if (base >= FRETE_GRATIS) {
        frete = 0
    }

    let total = base + frete

    return {
        subtotal: subtotal,
        desconto: desconto,
        base: base,
        frete: frete,
        total: total
    }
}


//Verificar carrinho
function verificarCarrinho() {
    const lista = document.getElementById('lista')

    if (carrinho.length === 0) {
        lista.innerHTML =
            `<div class="vazio">
                    <div class="icone">🛒</div>
                    <h2>Seu carrinho está vazio</h2>
                    <p>Adicione produtos para continuar.</p>
                    <a class="btn" href="/index.html">Ir para a loja</a>
                </div>
            `;

        document.getElementById('resumo').hidden = true
        document.getElementById('contador').textContent = 0

        document.body.classList.add('carrinho-vazio')

        return true
    }

    document.getElementById('resumo').hidden = false
    document.body.classList.remove('carrinho-vazio')

    return false
}


// Desenhar produtos 
function desenharItens() {
    const lista = document.getElementById('lista')

    lista.innerHTML = ''

    let totalItens = 0

    for (let i = 0; i < carrinho.length; i++) {
        const item = carrinho[i]

        totalItens += item.qtd

        // Se img for um link, mostra a imagem; se for emoji, mostra o emoji
        let foto = item.img || '📦'

        if (foto.startsWith('http')) {
            foto = `<img src="${foto}" alt="${item.nome}">`
        }

        lista.innerHTML += `
            <div class="item">
                <div class="foto">${foto}</div>

                <div>
                    <small>${item.cat || ''}</small>
                    <h3>${item.nome}</h3>
                    <div class="preco-un">${formatar(item.preco)} / un.</div>
                </div>

                <div class="direita">
                    <div class="quantidade">
                        <button onclick="mudarQtd('${item.id}', -1)">−</button>
                        <span>${item.qtd}</span>
                        <button onclick="mudarQtd('${item.id}', 1)">+</button>
                    </div>

                    <div class="subtotal-item">${formatar(item.preco * item.qtd)}</div>

                    <button class="remover" onclick="remover('${item.id}')">Remover</button>
                </div>
            </div>
        `
    }

    return totalItens
}


// Atualizar resumo 
function atualizarResumo(totalItens, totais) {
    document.getElementById('contador').textContent = totalItens
    document.getElementById('subtotal').textContent = formatar(totais.subtotal)

    if (totais.frete > 0) {
        document.getElementById('frete').textContent = formatar(totais.frete)
    } else {
        document.getElementById('frete').textContent = 'Grátis'
    }

    document.getElementById('total').textContent = formatar(totais.total)
}


// Atualizar cupom
function atualizarCupom(totais) {
    document.getElementById('linhaDesconto').hidden = !cupomAtual

    if (cupomAtual) {
        document.getElementById('nomeCupom').textContent = cupomAtual
        document.getElementById('valorDesconto').textContent = '− ' + formatar(totais.desconto)
    }
}


// Atualizar frete

function atualizarFrete(totais) {
    if (totais.frete > 0) {
        document.getElementById('msgFrete').textContent = 'Faltam ' + formatar(FRETE_GRATIS - totais.base) + ' para frete grátis!'
    } else {
        document.getElementById('msgFrete').textContent = '🎉 Você ganhou frete grátis!'
    }

    let progresso = (totais.base / FRETE_GRATIS) * 100

    if (progresso > 100) {
        progresso = 100
    }

    document.getElementById('progresso').style.width = progresso + '%'
}


// Desenhar carrinho 
function desenhar() {
    if (verificarCarrinho()) {
        return
    }

    const totalItens = desenharItens()
    const totais = calcularTotais()

    atualizarResumo(totalItens, totais)
    atualizarCupom(totais)
    atualizarFrete(totais)
}


// Ações do carrinho 
function mudarQtd(id, mudanca) {
    for (let i = 0; i < carrinho.length; i++) {
        if (carrinho[i].id === id) {
            carrinho[i].qtd += mudanca

            if (carrinho[i].qtd < 1) {
                carrinho.splice(i, 1)
            }

            break
        }
    }

    salvar()
}

function remover(id) {
    carrinho = carrinho.filter(function(item) {
        return item.id !== id
    })

    salvar()

    mostrarAviso('Item removido')
}

function esvaziar() {
    carrinho = []
    cupomAtual = null

    localStorage.removeItem('cupom')

    salvar();
}

// Cupom de desconto 
function aplicarCupom() {
    const codigo = document.getElementById('campoCupom').value.trim().toUpperCase()
    const msg = document.getElementById('msgCupom')

    if (CUPONS[codigo]) {
        cupomAtual = codigo

        localStorage.setItem('cupom', codigo)

        desenhar()

        msg.className = 'ok'
        msg.textContent = 'Cupom aplicado!'
    } else {
        msg.className = 'erro'
        msg.textContent = 'Cupom inválido.'
    }
}


// Finalizar compra 

function finalizar() {

    // Verificar se o usuário está logado

    if (!localStorage.getItem('usuario_logado')) {
        alert('Faça login para finalizar a compra.')

        location.href = '/pages/login/login.html'

        return
    }


    // Salvar pedido no histórico

    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || []

    pedidos.push({
        data: new Date().toLocaleString('pt-BR'),
        itens: carrinho.length,
        total: calcularTotais().total
    });

    localStorage.setItem('pedidos', JSON.stringify(pedidos))


    // Limpar carrinho

    esvaziar()

    mostrarAviso('✔ Pedido realizado com sucesso!')
}


// Início: lê o JSON, monta o carrinho com os dados dele e desenha a página
async function iniciar() {
    try {
        const resposta = await fetch(ARQUIVO_PRODUTOS)
        produtos = await resposta.json()
    } catch (erro) {
        console.error('Não foi possível carregar ' + ARQUIVO_PRODUTOS, erro)
        mostrarAviso('Produtos não carregaram. Abra a página por um servidor local.')
    }

    carrinho = lerCarrinho()

    desenhar()
}

iniciar()