# Python e Django na Prática: Desenvolvendo uma Aplicação Web Integrada à Inteligência Artificial

**Minicurso TechWeek | Apostila do participante | Duração: 4 horas**  
**Projeto integrador:** CompraSense — análise de sentimentos de comentários sobre compras  
**Público-alvo:** estudantes com noções de lógica de programação  
**Modalidade:** oficina presencial, com demonstrações e exercícios

> **Nota sobre a API:** neste material, `http://localhost:8001` representa o endereço de desenvolvimento da API FastAPI. No evento, substitua-o pelo endereço HTTPS institucional informado pelo instrutor. O contrato apresentado (`POST /v1/sentiment/predict`) deve ser conferido com o Swagger real antes da aula.

## Apresentação

Como um site de comércio eletrônico pode analisar automaticamente a opinião de seus clientes? Neste minicurso construiremos uma aplicação web em Django que recebe comentários sobre experiências de compra, envia os textos a uma API REST de inteligência artificial e mostra a classificação **positiva**, **neutra** ou **negativa**. O Django será o cliente HTTP da API FastAPI. O modelo Transformer já estará treinado e publicado pelo instrutor; não será necessário treinar IA ou usar GPU.

### Objetivo geral

Desenvolver uma aplicação web funcional utilizando Python e Django, compreendendo sua arquitetura, persistência de dados, autenticação, formulários e integração com uma API REST externa.

### Objetivos específicos

Ao final, o participante deverá ser capaz de: (1) ler estruturas básicas de Python e JSON; (2) distinguir navegador, Django e FastAPI; (3) criar um projeto e uma aplicação Django; (4) implementar model, view, template e URL; (5) criar e validar formulários; (6) utilizar autenticação nativa; (7) fazer POST HTTP com `requests`; (8) salvar e consultar avaliações; (9) identificar falhas de integração e testá-las.

### Pré-requisitos e preparação

- Python 3.11 ou superior instalado e disponível no terminal; VS Code e extensão Python instalados.
- Conexão à API do instrutor, ou servidor mock local fornecido como contingência.
- Conhecimentos básicos de variáveis, funções e condicionais são úteis, mas serão revisados.
- O instrutor disponibilizará os arquivos de estilo `base.html`, um template inicial e checkpoints do repositório para recuperar alunos que enfrentem dificuldades.
- Em Windows, utilize PowerShell; no Linux/WSL2/macOS, utilize Bash. Os comandos de ativação do ambiente virtual diferem.

## Cronograma de 240 minutos

| Horário | Módulo | Duração | Produto da etapa |
|---|---|---:|---|
| 00:00–00:30 | 1. Python, Web, HTTP e JSON | 30 min | Exercício Python e compreensão do fluxo |
| 00:30–01:10 | 2. Ambiente e Django | 40 min | Servidor Django executando |
| 01:10–02:00 | 3. MVT, ORM e interface | 50 min | Página inicial e banco estruturado |
| 02:00–02:40 | 4. Login e formulário | 40 min | Comentário validado por usuário autenticado |
| 02:40–03:40 | 5. API REST e histórico | 60 min | Classificação exibida e persistida |
| 03:40–04:00 | 6. Testes e fechamento | 20 min | Fluxo completo validado |

---

# Módulo 1 — Python, aplicações web e APIs REST (30 minutos)

**Meta:** entender como dados de um formulário chegam a uma API e retornam como uma classificação.

### 1.1 Python em poucas linhas (10 min)

Python é uma linguagem de programação usada em automação, análise de dados, desenvolvimento web e inteligência artificial. Os blocos de código são definidos por indentação.

```python
comentario = "O produto chegou antes do prazo!"
nota = 5
aprovado = nota >= 4

avaliacao = {
    "text": comentario,
    "nota": nota,
    "aprovado": aprovado,
}


def resumir(item):
    return f"Comentário: {item['text']}"

print(resumir(avaliacao))
```

**Entenda:** `comentario` é uma string; `nota` é um inteiro; `aprovado` é um booleano; `avaliacao` é um dicionário; `resumir` é uma função. Em Python, importamos bibliotecas para reutilizar funcionalidades.

**Prática (3 min):** altere o texto e a nota, execute o script e observe os valores impressos.

### 1.2 Como funciona uma aplicação web? (7 min)

- **Navegador:** apresenta a interface e envia formulários.
- **Servidor Django:** recebe requisições, aplica regras, consulta o banco e gera páginas HTML.
- **Servidor FastAPI:** disponibiliza um endpoint HTTP para classificação de sentimentos.
- **Banco SQLite:** guarda as avaliações de cada usuário.

**Fluxo da aplicação:** navegador → Django → FastAPI → Django → SQLite e template → navegador. O navegador **não** chamará diretamente a API de IA neste exercício; quem faz isso é o servidor Django.

### 1.3 HTTP, REST e JSON (7 min)

HTTP é o protocolo de comunicação da Web. `GET` consulta recursos; `POST` envia dados. Alguns códigos comuns: `200` (sucesso), `400` (requisição inválida), `401` (não autenticado), `404` (não encontrado), `422` (dados inválidos, comum no FastAPI) e `500` (erro interno).

JSON é um formato textual de troca de dados:

```json
{"text": "Gostei muito da compra!"}
```

Exemplo de resposta **ilustrativa** da API:

```json
{
  "sentiment": "positive",
  "confidence": 0.97,
  "probabilities": {"positive": 0.97, "neutral": 0.02, "negative": 0.01}
}
```

A confiança expressa a pontuação do modelo, **não** uma garantia de acerto.

### 1.4 Exercício e verificação (6 min)

1. Crie um dicionário Python com as chaves `sentiment` e `confidence`.
2. Imprima apenas o valor de `sentiment`.
3. Explique, com suas palavras, por que Django envia um `POST` ao FastAPI.

**Aceite para avançar:** script executado, acesso a um valor de dicionário demonstrado e distinção entre GET e POST compreendida.

---

# Módulo 2 — Ambiente de desenvolvimento e projeto Django (40 minutos)

**Meta:** criar o CompraSense e iniciar o servidor local.

### 2.1 Ambiente virtual e dependências (12 min)

O ambiente virtual (`venv`) isola as dependências de cada projeto. Abra o terminal no VS Code:

```bash
mkdir comprasense-web
cd comprasense-web
python -m venv .venv
```

Ative o ambiente:

```bash
# Linux, macOS ou WSL2
source .venv/bin/activate

# Windows PowerShell (alternativa)
# .\.venv\Scripts\Activate.ps1
```

Instale as bibliotecas:

```bash
python -m pip install "Django>=5.2,<6" "requests>=2.32,<3"
python -m django --version
```

> O intervalo de versões é uma referência para a oficina. O instrutor deve testar e fixar versões específicas em `requirements.txt` antes do evento.

### 2.2 Criando o projeto e a aplicação (8 min)

```bash
django-admin startproject config .
python manage.py startapp reviews
```

**Projeto** é a configuração geral do site (`config`). **App** é um módulo de funcionalidades (`reviews`).

Estrutura principal:

```text
comprasense-web/
├── .venv/
├── config/
│   ├── settings.py
│   ├── urls.py
│   └── ...
├── reviews/
│   ├── models.py
│   ├── views.py
│   └── ...
└── manage.py
```

### 2.3 Configuração inicial (12 min)

No `config/settings.py`, adicione `reviews` a `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    # apps padrão gerados pelo Django (mantenha-os)
    # ...
    "reviews",
]
```

**Atenção:** o bloco acima é ilustrativo; **não substitua** a lista completa gerada pelo Django. Acrescente apenas `"reviews"` à lista existente. O SQLite já é configurado por padrão no projeto novo.

Configure o idioma, fuso horário e as rotas de autenticação:

```python
LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Rio_Branco"  # ajuste para o local da oficina, se necessário
LOGIN_URL = "login"
LOGIN_REDIRECT_URL = "home"
LOGOUT_REDIRECT_URL = "home"
```

Execute as migrações padrão e inicie o servidor:

```bash
python manage.py migrate
python manage.py runserver
```

Acesse `http://127.0.0.1:8000/`. Pare o servidor com `Ctrl+C` quando precisar executar outros comandos no mesmo terminal.

### 2.4 Exercício e verificação (8 min)

1. Identifique a finalidade de `manage.py`, `settings.py` e `urls.py`.
2. Confirme a versão instalada do Django.
3. Abra a página inicial no navegador.

**Aceite:** ambiente virtual ativo, dependências instaladas, app registrado, migrações concluídas e servidor acessível.

---

# Módulo 3 — Models, Views, Templates e URLs (50 minutos)

**Meta:** estruturar o banco e mostrar uma página HTML própria.

### 3.1 O padrão MVT (8 min)

- **Model:** descreve os dados e permite consultá-los por meio do ORM.
- **View:** recebe uma requisição, processa informações e devolve uma resposta.
- **Template:** define a apresentação HTML.
- **URL dispatcher:** associa caminhos da aplicação às views.

**Exemplo:** quando o usuário abre `/`, a rota chama a view `home`, que renderiza `home.html`.

### 3.2 Model e ORM (12 min)

Em `reviews/models.py`:

```python
from django.conf import settings
from django.db import models


class Avaliacao(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="avaliacoes",
    )
    comentario = models.TextField(max_length=1000)
    sentimento = models.CharField(max_length=20)
    confianca = models.FloatField()
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario}: {self.sentimento}"
```

**Conceitos:** chave estrangeira, tipos de campos, limite de tamanho, criação automática da data e relacionamento entre usuário e avaliação.

```bash
python manage.py makemigrations
python manage.py migrate
```

O **ORM** permite consultar registros com Python, sem escrever SQL diretamente.

### 3.3 View, URLs e templates (23 min)

Em `reviews/views.py`:

```python
from django.shortcuts import render


def home(request):
    return render(request, "reviews/home.html")
```

Crie `reviews/urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
]
```

Em `config/urls.py`:

```python
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("reviews.urls")),
]
```

Crie a estrutura:

```text
reviews/
└── templates/
    └── reviews/
        ├── base.html
        └── home.html
```

Em `reviews/templates/reviews/base.html`:

```html
<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CompraSense</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <nav class="navbar navbar-dark bg-primary mb-4">
    <div class="container"><a class="navbar-brand" href="{% url 'home' %}">CompraSense</a></div>
  </nav>
  <main class="container">
    {% block content %}{% endblock %}
  </main>
</body>
</html>
```

> O Bootstrap via CDN precisa de internet. O instrutor deve fornecer uma cópia local ou CSS básico como contingência.

Em `reviews/templates/reviews/home.html`:

```html
{% extends "reviews/base.html" %}
{% block content %}
  <h1>Bem-vindo ao CompraSense</h1>
  <p>Descubra o sentimento de comentários sobre experiências de compra.</p>
  <a class="btn btn-primary" href="{% url 'avaliar' %}">Avaliar compra</a>
{% endblock %}
```

**Observação:** a rota `avaliar` será criada no módulo 4. Até lá, para executar a página sem erro de `NoReverseMatch`, substitua temporariamente o link por `<span class="btn btn-secondary">Avaliar compra (em breve)</span>`; restaure o link no módulo 4.

### 3.4 Exercício e verificação (7 min)

1. Altere o título da página inicial.
2. Explique o papel de `render()`.
3. Execute `makemigrations` e `migrate` e confira se a página abre.

**Aceite:** model definido, migrações aplicadas, rota `/` funcionando e template renderizado.

---

# Módulo 4 — Autenticação e formulários (40 minutos)

**Meta:** exigir login e receber comentários válidos.

### 4.1 Login e sessões (10 min)

O Django oferece autenticação pronta. Crie um usuário de teste:

```bash
python manage.py createsuperuser
```

No `config/urls.py`, adicione as rotas nativas de autenticação:

```python
urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("django.contrib.auth.urls")),
    path("", include("reviews.urls")),
]
```

O `LoginView` procura, por padrão, o template `registration/login.html`. Crie `reviews/templates/registration/login.html`:

```html
{% extends "reviews/base.html" %}
{% block content %}
<h1>Entrar</h1>
<form method="post">
  {% csrf_token %}
  {{ form.as_p }}
  <button class="btn btn-primary" type="submit">Entrar</button>
</form>
{% endblock %}
```

Teste `http://127.0.0.1:8000/accounts/login/`.

### 4.2 Django Forms e validação (12 min)

Crie `reviews/forms.py`:

```python
from django import forms


class AvaliacaoForm(forms.Form):
    comentario = forms.CharField(
        label="Como foi sua experiência de compra?",
        min_length=5,
        max_length=1000,
        widget=forms.Textarea(attrs={
            "class": "form-control",
            "rows": 4,
            "placeholder": "Escreva seu comentário...",
        }),
    )
```

**Conceitos:** validação de campos, `request.POST`, `is_valid()`, `cleaned_data` e CSRF.

### 4.3 View protegida e template do formulário (13 min)

Acrescente a `reviews/views.py`:

```python
from django.contrib.auth.decorators import login_required
from .forms import AvaliacaoForm


@login_required
def avaliar(request):
    form = AvaliacaoForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        # A integração com a API será adicionada no módulo 5.
        return render(request, "reviews/avaliar.html", {
            "form": form,
            "mensagem": "Comentário validado com sucesso!",
        })
    return render(request, "reviews/avaliar.html", {"form": form})
```

Em `reviews/urls.py`, adicione:

```python
path("avaliar/", views.avaliar, name="avaliar"),
```

Crie `reviews/templates/reviews/avaliar.html`:

```html
{% extends "reviews/base.html" %}
{% block content %}
<h1>Analisar comentário</h1>
{% if mensagem %}<div class="alert alert-info">{{ mensagem }}</div>{% endif %}
<form method="post">
  {% csrf_token %}
  {{ form.as_p }}
  <button class="btn btn-primary" type="submit">Analisar</button>
</form>
{% endblock %}
```

Agora restaure o link `Avaliar compra` da página inicial, se o havia substituído temporariamente.

### 4.4 Exercício e verificação (5 min)

1. Acesse `/avaliar/` sem estar autenticado e observe o redirecionamento.
2. Entre com o usuário de teste e envie um comentário.
3. Envie um comentário vazio e observe a validação.

**Aceite:** login funciona; rota protegida; formulário com CSRF; comentário inválido é rejeitado.

---

# Módulo 5 — Integração REST, resultados e histórico (60 minutos)

**Meta:** conectar o Django ao serviço de IA e persistir os resultados.

### 5.1 Explorando o Swagger da FastAPI (8 min)

Abra a URL `/docs` do serviço fornecido pelo instrutor. Localize `POST /v1/sentiment/predict`, examine o corpo JSON e a resposta. Teste o endpoint usando **Try it out**. O exemplo de contrato adotado nesta apostila é:

**Requisição**:

```json
{"text": "A entrega foi rápida e o produto é excelente!"}
```

**Resposta ilustrativa**:

```json
{
  "sentiment": "positive",
  "confidence": 0.97,
  "probabilities": {"positive": 0.97, "neutral": 0.02, "negative": 0.01}
}
```

> Se a API real tiver nomes de campos ou caminhos diferentes, adapte o cliente conforme o Swagger. Não altere silenciosamente o contrato.

### 5.2 Configurando o endereço da API (5 min)

Para a oficina, configure em `config/settings.py`:

```python
import os

SENTIMENT_API_URL = os.environ.get(
    "SENTIMENT_API_URL",
    "http://127.0.0.1:8001/v1/sentiment/predict",
)
```

**Importante:** `127.0.0.1` só funciona se a API estiver na mesma máquina/ambiente de rede. No minicurso, defina `SENTIMENT_API_URL` com a URL HTTPS da API institucional antes de iniciar o Django. Não coloque credenciais no código.

### 5.3 Cliente HTTP isolado em `services.py` (15 min)

Crie `reviews/services.py`:

```python
import requests
from django.conf import settings


class SentimentAPIError(Exception):
    """Falha de comunicação ou resposta inválida da API."""


def analisar_sentimento(texto: str) -> dict:
    try:
        response = requests.post(
            settings.SENTIMENT_API_URL,
            json={"text": texto},
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()

        sentimento = data["sentiment"]
        confianca = float(data["confidence"])
        if sentimento not in {"positive", "neutral", "negative"}:
            raise ValueError("Rótulo desconhecido")
        if not 0 <= confianca <= 1:
            raise ValueError("Confiança fora do intervalo")

        return {"sentiment": sentimento, "confidence": confianca}
    except (requests.RequestException, ValueError, KeyError, TypeError) as exc:
        raise SentimentAPIError("Não foi possível analisar o comentário.") from exc
```

**Explique:** `json=` envia JSON, `timeout` evita espera ilimitada, `raise_for_status()` detecta erros HTTP, `response.json()` converte a resposta em dicionário. A exceção própria evita exibir detalhes internos ao usuário.

### 5.4 Integrando a view e salvando no banco (12 min)

Substitua a função `avaliar` em `reviews/views.py` por:

```python
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from .forms import AvaliacaoForm
from .models import Avaliacao
from .services import SentimentAPIError, analisar_sentimento


ROTULOS = {
    "positive": "Positivo",
    "neutral": "Neutro",
    "negative": "Negativo",
}


@login_required
def avaliar(request):
    form = AvaliacaoForm(request.POST or None)
    contexto = {"form": form}

    if request.method == "POST" and form.is_valid():
        comentario = form.cleaned_data["comentario"]
        try:
            resultado = analisar_sentimento(comentario)
        except SentimentAPIError:
            contexto["erro"] = "Serviço indisponível. Tente novamente."
        else:
            Avaliacao.objects.create(
                usuario=request.user,
                comentario=comentario,
                sentimento=resultado["sentiment"],
                confianca=resultado["confidence"],
            )
            contexto["resultado"] = {
                "sentimento": ROTULOS[resultado["sentiment"]],
                "confianca_percentual": round(resultado["confidence"] * 100, 1),
            }
            contexto["form"] = AvaliacaoForm()

    return render(request, "reviews/avaliar.html", contexto)
```

**Discussão:** o registro é salvo apenas depois de uma resposta válida. O usuário autenticado é associado à avaliação.

### 5.5 Apresentando o resultado (8 min)

Atualize `reviews/templates/reviews/avaliar.html`:

```html
{% extends "reviews/base.html" %}
{% block content %}
<h1>Analisar comentário</h1>
{% if erro %}<div class="alert alert-danger">{{ erro }}</div>{% endif %}
{% if resultado %}
  <div class="alert alert-success">
    Sentimento: <strong>{{ resultado.sentimento }}</strong><br>
    Confiança do modelo: {{ resultado.confianca_percentual }}%
  </div>
{% endif %}
<form method="post">
  {% csrf_token %}
  {{ form.as_p }}
  <button class="btn btn-primary" type="submit">Analisar</button>
</form>
<a href="{% url 'historico' %}">Ver meu histórico</a>
{% endblock %}
```

O link de histórico ficará disponível depois que a rota abaixo for criada.

### 5.6 Histórico de avaliações (7 min)

Adicione a `reviews/views.py`:

```python
@login_required
def historico(request):
    avaliacoes = Avaliacao.objects.filter(
        usuario=request.user
    ).order_by("-criado_em")
    return render(request, "reviews/historico.html", {
        "avaliacoes": avaliacoes,
        "rotulos": ROTULOS,
    })
```

Adicione a `reviews/urls.py`:

```python
path("historico/", views.historico, name="historico"),
```

Crie `reviews/templates/reviews/historico.html`:

```html
{% extends "reviews/base.html" %}
{% block content %}
<h1>Minhas avaliações</h1>
{% for item in avaliacoes %}
  <article class="card mb-3"><div class="card-body">
    <p>{{ item.comentario }}</p>
    <p>Sentimento: {{ item.sentimento }} |
       Confiança: {{ item.confianca|floatformat:2 }}</p>
    <small>{{ item.criado_em }}</small>
  </div></article>
{% empty %}
  <p>Você ainda não realizou avaliações.</p>
{% endfor %}
{% endblock %}
```

> **Melhoria opcional:** traduzir os rótulos no histórico por meio de uma propriedade do model ou `get_sentimento_display()`. A versão básica mostra os rótulos canônicos da API para manter o código simples.

### 5.7 Exercício e verificação (5 min)

1. Envie um comentário positivo: “Gostei do atendimento e a entrega foi rápida”.
2. Envie um comentário negativo: “O produto chegou quebrado e atrasado”.
3. Experimente um comentário neutro: “O pedido foi entregue na terça-feira”.
4. Confira o histórico. A classificação pode variar: o modelo é probabilístico e pode errar.

**Aceite:** POST funcional; JSON interpretado; resultado exibido; registro salvo; histórico filtrado pelo usuário; falha externa tratada.

---

# Módulo 6 — Testes, desafios e conclusão (20 minutos)

**Meta:** demonstrar o fluxo completo e identificar erros comuns.

### 6.1 Roteiro de testes manuais (12 min)

| Teste | Procedimento | Resultado esperado |
|---|---|---|
| Acesso público | Abrir `/` | Página inicial carrega |
| Proteção de rota | Abrir `/avaliar/` sem login | Redireciona ao login |
| Login | Autenticar usuário de teste | Acesso liberado |
| Validação | Enviar texto vazio | Mensagem de validação |
| Integração | Enviar comentário válido | Sentimento e confiança exibidos |
| Persistência | Abrir `/historico/` | Avaliação recém-criada aparece |
| Isolamento | Entrar com outro usuário | Não vê registros do primeiro |
| Indisponibilidade | Usar URL de API inválida no ambiente de teste | Mensagem amigável, sem registro falso |

### 6.2 Exercício de consolidação (5 min)

Responda:

1. Qual componente do Django descreve a tabela de avaliações?
2. Qual função é responsável por chamar a API FastAPI?
3. Por que a aplicação utiliza `timeout`?
4. Onde o resultado é persistido?
5. Qual é a diferença entre `GET /historico/` e `POST /v1/sentiment/predict`?

**Respostas esperadas:** (1) model `Avaliacao`; (2) `analisar_sentimento`; (3) evitar bloqueio indefinido; (4) SQLite via ORM; (5) consulta de página/dados versus envio de texto para inferência.

### 6.3 Encerramento (3 min)

Recapitule o fluxo: **formulário HTML → view Django → validação → cliente HTTP → FastAPI/Transformer → resposta JSON → ORM/SQLite → template HTML**.

**Desafio pós-curso:** adicionar cores distintas para sentimentos; paginação no histórico; testes automatizados; autenticação por cadastro; gráfico de distribuição de sentimentos; armazenamento de probabilidade por classe.

---

# Apêndice A — Arquivos finais esperados

```text
comprasense-web/
├── .venv/                       # não versionar
├── config/
│   ├── settings.py
│   └── urls.py
├── reviews/
│   ├── migrations/
│   ├── templates/
│   │   ├── registration/
│   │   │   └── login.html
│   │   └── reviews/
│   │       ├── base.html
│   │       ├── home.html
│   │       ├── avaliar.html
│   │       └── historico.html
│   ├── forms.py
│   ├── models.py
│   ├── services.py
│   ├── urls.py
│   └── views.py
├── db.sqlite3                    # banco local
├── manage.py
└── requirements.txt
```

## Apêndice B — Critérios de aceitação globais

- [ ] Projeto Django inicia sem erros.
- [ ] Landing page acessível.
- [ ] Model `Avaliacao` migrado.
- [ ] Login e rota protegida funcionando.
- [ ] Formulário valida textos obrigatórios.
- [ ] API externa responde à chamada do Django.
- [ ] Resultado de sentimento aparece no HTML.
- [ ] Avaliação é salva no SQLite.
- [ ] Histórico exibe somente dados do usuário autenticado.
- [ ] Erros de rede são tratados sem expor detalhes internos.

## Apêndice C — Boas práticas essenciais

1. Nunca incluir senhas, tokens ou `.env` com segredos no Git.
2. Utilizar HTTPS na API institucional e validar certificados TLS.
3. Definir timeout nas chamadas externas.
4. Não considerar a confiança do modelo como probabilidade garantida de acerto.
5. Não enviar dados pessoais reais desnecessários para a API.
6. Manter CSRF ativado em formulários Django.
7. Não desabilitar `DEBUG` e segurança de produção apenas para “resolver” erros de configuração.
8. Manter o serviço HTTP em `services.py` para facilitar testes e manutenção.
9. Versionar `requirements.txt` e utilizar checkpoints por módulo.
10. Para o curso, usar uma API mock de contingência se a infraestrutura estiver indisponível.

## Apêndice D — Checklist do instrutor (antes da aula)

- [ ] Validar contrato e URL real no Swagger (`/docs`).
- [ ] Confirmar acesso dos computadores dos alunos à API.
- [ ] Testar exemplos de sentimentos em português brasileiro.
- [ ] Preparar usuário(s) de teste e templates.
- [ ] Preparar repositório com tags de recuperação após cada módulo.
- [ ] Preparar mock local compatível com o contrato.
- [ ] Ensaiar a sequência inteira em 240 minutos.
- [ ] Preparar arquivos Bootstrap locais para uso sem internet.

**Nota pedagógica:** o minicurso prioriza entendimento e integração. A aplicação apresentada é um MVP didático; para produção, acrescente testes automatizados, observabilidade, limites de requisição, autenticação/controle de acesso à API e políticas de privacidade adequadas.
