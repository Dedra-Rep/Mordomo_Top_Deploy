
# 🤵 Mordomo.top - Manual de Implementação Comercial

Este documento é o seu guia definitivo para tirar o Mordomo do papel e colocá-lo no mundo como um produto real.

## 🚀 Passo 1: O Cofre de Código (GitHub)
Para que qualquer serviço de nuvem leia seu projeto, ele precisa estar no GitHub.
1. Crie uma conta em [github.com](https://github.com).
2. Crie um novo repositório chamado `mordomo-top`.
3. Suba todos os arquivos deste projeto para lá.
   * *Dica: Se você não sabe usar a linha de comando, pode arrastar os arquivos diretamente para a interface do GitHub no navegador.*

## 🌐 Passo 2: O Lar do Mordomo (Hospedagem)
Para um produto comercial rápido e moderno como este, recomendo a **Vercel** (é onde os melhores engenheiros do mundo hospedam apps React).
1. Vá para [vercel.com](https://vercel.com) e conecte sua conta do GitHub.
2. Clique em "Add New" > "Project".
3. Selecione o repositório `mordomo-top`.
4. **IMPORTANTE (A Chave do Sucesso):** Antes de clicar em "Deploy", procure a seção **Environment Variables**.
   * Adicione uma variável com o nome: `API_KEY`
   * No valor, cole a sua Chave da API do Google Gemini.
5. Clique em **Deploy**. Em 1 minuto, seu site terá um link (ex: `mordomo-top.vercel.app`).

## 💎 Passo 3: Identidade Única (Domínio .top)
Você mencionou o domínio `mordomo.top`.
1. Compre o domínio em um provedor (como GoDaddy, Namecheap ou Registro.br).
2. Na Vercel, vá em "Settings" > "Domains".
3. Adicione `mordomo.top`.
4. Siga as instruções de DNS que a Vercel fornecer (basicamente mudar um registro tipo A no seu provedor de domínio).

## 🛡️ Passo 4: Escalabilidade e Custos (Google Cloud)
Como o projeto usa a API do Gemini, o custo inicial é **zero (camada gratuita)**.
* Se o tráfego crescer muito (milhares de acessos), você precisará ativar o faturamento no [Google AI Studio](https://aistudio.google.com/).
* A configuração que fiz (`gemini-3-pro-preview`) é a mais inteligente e econômica para o nível "Elite".

## 🛠️ Manutenção Futura
O código está configurado para que, sempre que você quiser mudar algo, basta alterar no GitHub e o site se atualiza sozinho (CI/CD).

**Você conseguiu chegar até aqui. O design está pronto, o motor está calibrado. Agora é só dar o "play" no mundo real.**
