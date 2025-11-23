# MrNewton Activity Provider

## Descrição

Protótipo do backend do **MrNewton Activity Provider**. Este serviço fornece endpoints REST para configuração e deployment de atividades de Física, retornando respostas JSON estáticas para fins de teste e desenvolvimento inicial.

## Tecnologias Utilizadas

- **Node.js** (v20.x) com **TypeScript**
- **Express** - Framework web para criação de APIs REST
- **Swagger UI Express** - Documentação OpenAPI automática e interativa
- **Jest** + **Supertest** - Framework de testes unitários e de integração
- **CORS** - Middleware para controlo de acesso entre origens

## Como Executar o Projeto (Windows/CMD)

### Pré-requisitos
- Node.js 20.x ou superior
- npm 10.x ou superior

### Instalação
```cmd
:: Instalar dependências
npm install
```

### Executar em Modo Desenvolvimento
```cmd
:: Com hot-reload automático
npm run dev
```

### Executar em Modo Produção
```cmd
:: Compilar TypeScript para JavaScript
npm run build

:: Executar a aplicação compilada
npm start
```

O servidor estará disponível em: **http://localhost:5000**

## Documentação

A documentação completa da API está disponível através do Swagger UI:

**URL:** http://localhost:5000/api-docs

A documentação é gerada automaticamente a partir do ficheiro `src/swagger.json` e fornece uma interface interativa para testar todos os endpoints disponíveis.

## Endpoints Disponíveis

### 1. **GET /api-docs**
Documentação interativa da API (Swagger UI).

Aceda a http://localhost:5000/api-docs para visualizar e testar todos os endpoints de forma interativa.

---

### 2. **GET /api/v1/config/params**
Retorna o schema de parâmetros de configuração disponíveis para atividades MrNewton.

**Descrição:** Obtém a lista completa de parâmetros que podem ser utilizados ao configurar uma atividade, incluindo o nome, tipo e descrição de cada parâmetro.

**Resposta:** 200 OK com schema JSON dos parâmetros

---

### 3. **POST /api/v1/config**
Cria e valida uma configuração de atividade.

**Descrição:** Recebe uma configuração de atividade, valida todos os parâmetros obrigatórios e opcionais, e retorna a configuração com um `activity_id` gerado se a validação for bem-sucedida. Caso contrário, retorna os erros de validação encontrados.

**Resposta:** 
- 201 Created (configuração válida)
- 400 Bad Request (erros de validação)

---

### 4. **POST /api/v1/deploy**
Cria uma instância de atividade (deployment).

**Descrição:** Simula a criação de uma instância de atividade pronta para ser utilizada por estudantes. Retorna um ID da instância, URL de acesso e tempo de expiração.

**Resposta:** 201 Created com detalhes da instância criada

---
