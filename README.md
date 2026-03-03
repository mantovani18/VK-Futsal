# VK Futsal - Site Oficial

Projeto em **HTML + CSS + JavaScript puro**, com:
- Home moderna e responsiva
- Formulário de inscrição para peneira
- Envio automático para Google Sheets via Apps Script
- Página de resultados carregada de planilha pública

## Estrutura

- `index.html`
- `inscricao.html`
- `resultado.html`
- `css/style.css`
- `js/script.js`

## Como configurar envio para Google Sheets (Inscrição)

1. Crie uma planilha no Google Sheets com abas e colunas desejadas.
2. Abra **Extensões > Apps Script**.
3. Cole um script com `doPost(e)` para receber JSON e gravar na planilha.
4. Publique em **Implantar > Nova implantação > App da Web**.
5. Em acesso, selecione **Qualquer pessoa** (ou conforme sua necessidade).
6. Copie a URL final do App da Web.
7. No arquivo `js/script.js`, altere:
   - `APPS_SCRIPT_URL = "COLE_AQUI_SUA_URL_DO_APPS_SCRIPT";`

## Como configurar leitura de resultados (Página Resultado)

1. Na planilha de resultados, crie colunas nesta ordem:
   - Nome
   - Categoria
   - Status
2. Publique a planilha/aba para leitura pública.
3. Gere a URL de CSV público, por exemplo:
   - `https://docs.google.com/spreadsheets/d/SEU_ID/export?format=csv&gid=0`
4. No `js/script.js`, altere:
   - `RESULTADOS_CSV_URL = "COLE_AQUI_SUA_URL_PUBLICA_CSV";`

## Segurança implementada

- `preventDefault()` no envio do formulário
- Validação de campos obrigatórios
- Validação de e-mail e telefone
- Sanitização básica de entradas
- Escape de HTML ao renderizar resultados

## Publicação

Você pode publicar em qualquer hospedagem estática:
- GitHub Pages
- Netlify
- Vercel (modo estático)

Basta enviar todos os arquivos mantendo a estrutura original.
