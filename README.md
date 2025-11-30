# Frontend - Sistema de Confirmação de Presença

Frontend em HTML/CSS/JavaScript para o sistema de confirmação de presença do aniversário.

## Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)
- PHP 8.4 (servidor local)

## Executar

Inicie o servidor PHP na pasta do frontend:

```bash
php -S localhost:8000
```

O frontend estará disponível em: `http://localhost:8000`

## Estrutura de Diretórios

```
aniversario-front/
├── assets/
│   ├── css/
│   │   └── style.css          # Estilos (prata e rose gold)
│   └── js/
│       └── confirmacao.js     # Lógica do frontend
├── index.html                 # Página principal
└── README.md                  # Este arquivo
```

## Paleta de Cores

- **Prata:** #C0C0C0, #E8E8E8
- **Rose Gold:** #B76E79, #E6B8C0

## Funcionalidades

1. Formulário de confirmação de presença
2. Validação de entrada
3. Integração com API backend
4. Exibição de mensagens de feedback
5. Pop-up com sugestões de presentes
6. Design responsivo

## Configuração

O frontend se comunica com o backend em `http://localhost:3000`.

Se o backend estiver em outra porta ou domínio, edite a URL da API no arquivo `assets/js/confirmacao.js`.

## Requisitos

- PHP 8.4+ instalado
- Backend rodando em `http://localhost:3000`
