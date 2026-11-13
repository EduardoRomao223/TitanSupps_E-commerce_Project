const abaLogin = document.getElementById('aba-login');
const abaCadastro = document.getElementById('aba-cadastro');
const formLogin = document.getElementById('form-login');
const formCadastro = document.getElementById('form-cadastro');
const mensagemFeedback = document.getElementById('mensagem-feedback');

const areaFormularios = document.getElementById('area-formularios');
const painelLogado = document.getElementById('painel-logado');
const nomeUsuarioLogado = document.getElementById('nome-usuario-logado');
const emailUsuarioLogado = document.getElementById('email-usuario-logado');
const btnSair = document.getElementById('btn-sair');
const btnExcluirConta = document.getElementById('btn-excluir-conta');
const navUsuario = document.getElementById('nav-usuario');


function obterUsuarios() {
    const dados = localStorage.getItem('usuarios_suplementos');
    return dados ? JSON.parse(dados) : [];
}

function salvarUsuarios(listaUsuarios) {
    localStorage.setItem('usuarios_suplementos', JSON.stringify(listaUsuarios));
}

function mostrarMensagem(texto, tipo) {
    mensagemFeedback.textContent = texto;
    mensagemFeedback.className = `feedback ${tipo}`; 
}

function verificarSessao() {
    const usuarioAtivo = JSON.parse(localStorage.getItem('usuario_logado'));

    if (usuarioAtivo) {
        areaFormularios.classList.add('oculto');
        painelLogado.classList.remove('oculto');
        
        nomeUsuarioLogado.textContent = usuarioAtivo.nome;
        emailUsuarioLogado.textContent = usuarioAtivo.email;

        const primeiroNome = usuarioAtivo.nome.split(' ')[0];
        navUsuario.textContent = `Olá, ${primeiroNome}`;
    } else {
        areaFormularios.classList.remove('oculto');
        painelLogado.classList.add('oculto');
        
        navUsuario.textContent = 'Login / Cadastro';
    }
}

abaLogin.addEventListener('click', () => {
    abaLogin.classList.add('ativa');
    abaCadastro.classList.remove('ativa');
    formLogin.classList.remove('oculto');
    formCadastro.classList.add('oculto');
    mensagemFeedback.classList.add('oculto');
});

abaCadastro.addEventListener('click', () => {
    abaCadastro.classList.add('ativa');
    abaLogin.classList.remove('ativa');
    formCadastro.classList.remove('oculto');
    formLogin.classList.add('oculto');
    mensagemFeedback.classList.add('oculto');
});

formCadastro.addEventListener('submit', (evento) => {
    evento.preventDefault(); 

    const nome = document.getElementById('cad-nome').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const senha = document.getElementById('cad-senha').value;

    const usuarios = obterUsuarios();

    const emailJaExiste = usuarios.some(u => u.email === email);

    if (emailJaExiste) {
        mostrarMensagem('Este e-mail já está cadastrado!', 'erro');
        return;
    }

    const novoUsuario = { nome, email, senha };
    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);

    formCadastro.reset();
    mostrarMensagem('Cadastro realizado! Faça login agora.', 'sucesso');
    
    setTimeout(() => {
        abaLogin.click();
    }, 1500);
});

formLogin.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;

    const usuarios = obterUsuarios();


    const usuarioEncontrado = usuarios.find(u => u.email === email && u.senha === senha);

    if (usuarioEncontrado) {

        localStorage.setItem('usuario_logado', JSON.stringify(usuarioEncontrado));
        formLogin.reset();
        verificarSessao();
    } else {
        mostrarMensagem('E-mail ou senha incorretos.', 'erro');
    }
});

btnSair.addEventListener('click', () => {
    localStorage.removeItem('usuario_logado');
    verificarSessao();
    mostrarMensagem('Você saiu da sua conta.', 'sucesso');
});

btnExcluirConta.addEventListener('click', () => {
    const usuarioAtivo = JSON.parse(localStorage.getItem('usuario_logado'));
    let usuarios = obterUsuarios();

    usuarios = usuarios.filter(u => u.email !== usuarioAtivo.email);
    
    salvarUsuarios(usuarios);
    localStorage.removeItem('usuario_logado');
    verificarSessao();
    mostrarMensagem('Conta excluída permanentemente do LocalStorage.', 'erro');
});

verificarSessao();