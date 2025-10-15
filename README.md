# 🎬 FrameCode — Plataforma de Avaliações de Filmes

![Status do Projeto](https://img.shields.io/badge/status-conclu%C3%ADdo-brightgreen)
![Licença](https://img.shields.io/badge/licen%C3%A7a-ISC-blue)

## 📖 Sobre o Projeto

O **FrameCode** é uma plataforma WEB completa e funcional para amantes de cinema. O projeto, que começou como uma aplicação frontend com persistência de dados no `localStorage`, evoluiu para uma solução full-stack robusta. Agora, a aplicação conta com um backend próprio, banco de dados para armazenar informações de usuários e suas interações, e uma API RESTful para gerenciar todos os dados da aplicação.

A plataforma permite que os usuários se cadastrem, façam login, explorem filmes populares, busquem por títulos e outros usuários, visualizem detalhes completos e, o mais importante, compartilhem suas opiniões através de avaliações com notas de 0 a 5 estrelas.

## 🔥 Funcionalidades

- **Autenticação de Usuários**: Sistema completo de cadastro e login com senhas criptografadas e autenticação baseada em tokens (JWT).
- **Exploração de Filmes**: Listagem de filmes populares consumindo a API do [TMDb](https://www.themoviedb.org/).
- **Busca Abrangente**: Pesquise por filmes e também por outros usuários cadastrados na plataforma.
- **Detalhes de Filmes**: Visualize informações detalhadas como sinopse, capa, elenco, gênero e data de lançamento.
- **Sistema de Avaliações (Reviews)**: Crie, edite e exclua suas próprias avaliações sobre os filmes.
- **Média de Notas**: O sistema calcula e exibe a média das avaliações de cada filme.
- **Perfil de Usuário**: Visualize e edite seu perfil, incluindo a possibilidade de trocar a foto de avatar.
- **Filmes Favoritos**: Adicione e gerencie uma lista de seus filmes favoritos.
- **Responsividade**: Interface adaptável para uma ótima experiência em dispositivos móveis.

## 🧪 Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias:

#### **Frontend**
- **HTML5**
- **CSS3**
- **JavaScript (Vanilla)**
- **API do TMDb**: Para busca e listagem de informações sobre os filmes.

#### **Backend**
- **Node.js**: Ambiente de execução para o servidor.
- **Express.js**: Framework para a construção da API RESTful.
- **MySQL**: Banco de dados relacional para armazenamento de dados.
- **jsonwebtoken (JWT)**: Para geração de tokens de autenticação.
- **bcryptjs**: Para criptografia de senhas.
- **CORS**: Para permitir requisições de diferentes origens.
- **.env**: Para gerenciamento de variáveis de ambiente.
- **Multer**: Middleware para upload de arquivos (utilizado para os avatares dos usuários).

## 🚀 Deploy

O deploy desta aplicação foi distribuído em três serviços de nuvem diferentes, seguindo uma arquitetura moderna e desacoplada:

- **Frontend:** O deploy do cliente (HTML, CSS, JS) foi realizado na **[Netlify](https://www.netlify.com/)**. A Netlify é responsável por servir os arquivos estáticos de forma rápida e eficiente para os usuários finais.

- **Backend:** A API REST (Node.js/Express) foi hospedada no **[Render](https://render.com/)**. O Render gerencia o servidor da aplicação, processando as requisições, aplicando a lógica de negócio e se comunicando com o banco de dados.

- **Banco de Dados:** O banco de dados MySQL foi provisionado através do **[Railway](https://railway.app/)**. O Railway oferece um serviço gerenciado para o banco de dados, garantindo que ele esteja sempre disponível e seguro para ser acessado pelo backend.

Essa arquitetura permite que cada parte da aplicação (frontend, backend, banco de dados) seja escalada e mantida de forma independente.

- URL do Frontend: https://framecode.netlify.app

## 👨‍💻 Autores

- **Gabriel Jerônimo** ([@gabrieljvrz](https://github.com/gabrieljvrz))
- **Hian Vinicius** ([@HIANV](https://github.com/HIANV))
- **Maverick Martins** ([@M4vericksm](https://github.com/M4vericksm))

Desenvolvedores em formação, apaixonados por desenvolvimento WEB.
