# Interface do CompraSense

Material de apoio à [apostila do minicurso](APOSTILA_TECHWEEK_COMPRASENSE.md).
Os arquivos desta entrega são a camada de apresentação: templates Django,
CSS, JavaScript e um ícone SVG local. Models, forms, views, autenticação e
cliente da API devem ser implementados conforme os módulos 2 a 5 da apostila.

## Arquivos

```text
reviews/
├── static/reviews/
│   ├── css/comprasense.css
│   ├── img/favicon.svg
│   └── js/comprasense.js
└── templates/
    ├── registration/login.html
    └── reviews/
        ├── base.html
        ├── home.html
        ├── avaliar.html
        └── historico.html
```

Não são necessários Bootstrap, fontes remotas, npm ou compilação dos arquivos.
Todos os recursos visuais são locais. O JavaScript adiciona contador de caracteres,
estado de envio e bloqueio de cliques repetidos; os formulários também funcionam
sem JavaScript. A chamada à API de sentimentos é feita pelo Django em `services.py`.

## Instalação no projeto da oficina

Se o projeto ainda não existe, siga o módulo 2 da apostila. Como esta entrega já
cria a pasta `reviews/`, execute `python manage.py startapp reviews` em uma pasta
temporária vazia e copie **somente os arquivos Python gerados** para `reviews/`,
preservando `templates/` e `static/`. Inclua também a pasta `migrations/` gerada.
Outra opção é criar o projeto da oficina em outra pasta e copiar estas duas
pastas para dentro do app `reviews` criado lá.

Em `config/settings.py`, mantenha os apps padrão e acrescente `reviews`:

```python
INSTALLED_APPS = [
    # Mantenha os apps padrão do Django, incluindo django.contrib.staticfiles.
    # ...
    "reviews",
]

LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Rio_Branco"
USE_TZ = True
STATIC_URL = "static/"
LOGIN_URL = "login"
LOGIN_REDIRECT_URL = "home"
LOGOUT_REDIRECT_URL = "home"
```

Na configuração `TEMPLATES` gerada pelo Django, mantenha `APP_DIRS = True` e
os processadores de contexto de `request`, `auth` e `messages`.
Não é necessário definir `STATICFILES_DIRS`: o Django encontra os recursos
em `reviews/static/` com o app instalado. Para uma futura publicação,
configure `STATIC_ROOT`, execute `collectstatic` e disponibilize o diretório
coletado pelo servidor de arquivos estáticos.

Em `config/urls.py`:

```python
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("accounts/", include("django.contrib.auth.urls")),
    path("", include("reviews.urls")),
]
```

Em `reviews/urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("avaliar/", views.avaliar, name="avaliar"),
    path("historico/", views.historico, name="historico"),
]
```

Os templates usam os nomes de rotas **sem namespace**, exatamente como na
apostila. As três rotas precisam existir antes de abrir as páginas, pois
são referenciadas na navegação. Sair utiliza formulário POST com CSRF.
O login usa o `LoginView` nativo e preserva o parâmetro `next`.
Não foi incluído cadastro: as contas são criadas pelo instrutor.

## Dados esperados dos templates

As views finais da apostila podem ser usadas sem adaptar as variáveis:

| Template | Contexto |
| --- | --- |
| `reviews/home.html` | Contexto padrão do Django; conteúdo público |
| `registration/login.html` | `form` de autenticação e `next`, fornecidos pelo `LoginView` |
| `reviews/avaliar.html` | `form` com campo `comentario`; opcionais `erro`, `mensagem` e `resultado` |
| `reviews/historico.html` | `avaliacoes`, filtradas pelo usuário autenticado na view |

O campo `comentario` deve usar `forms.Textarea`, `min_length=5` e
`max_length=1000`, conforme `AvaliacaoForm` da apostila. O CSS estiliza o
campo sem exigir classes extras no widget.

Exemplo do contexto `resultado`, **depois de validar a resposta da API e salvar**:

```python
contexto["resultado"] = {
    "sentimento": "Positivo",  # ou "Neutro" / "Negativo"
    "confianca_percentual": 97.0,
}
```

O resultado mostra a confiança em percentual. No histórico, o campo
`confianca` do model é apresentado na escala original de 0 a 1, com essa
escala indicada no texto. Os sentimentos do histórico são traduzidos a
partir de `positive`, `neutral` e `negative`, sem modificar o model.

Em falhas da API, devolva o formulário vinculado ao POST e a variável `erro`,
conforme a apostila, para preservar o comentário. A mensagem de avaliação salva
é exibida quando há `resultado`; por isso esse contexto deve ser preenchido
somente após a persistência bem-sucedida.

## Conferência no minicurso

Depois de implementar o backend da apostila:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py check
python manage.py findstatic reviews/css/comprasense.css
python manage.py runserver
```

1. Abra `/` e confira os links e a apresentação em tela larga e no celular.
2. Abra `/avaliar/` sem login e confirme o redirecionamento para autenticação.
3. Entre com a conta criada; envie um texto inválido e confira a validação.
4. Envie um comentário válido com a API configurada e confirme resultado e histórico.
5. Simule indisponibilidade da API; confira a mensagem e a preservação do texto.
6. Entre com outro usuário e confira o isolamento do histórico na view.
7. Use “Sair” e confira o encerramento da sessão.

O exemplo de classificação da landing page está identificado como ilustrativo.
Nenhum template produz análises fictícias para substituir a API.
