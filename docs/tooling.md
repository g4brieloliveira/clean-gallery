# Tooling

## Gerenciador de pacotes

**Decisão (CG-10):** usar **npm** como único gerenciador.

Justificativa: o repositório já tinha `package-lock.json` como fonte de verdade usada no README; manter Yarn em paralelo faz o EAS/CI inferir o gerenciador errado.

- Lockfile oficial: `package-lock.json`
- Não commitar `yarn.lock`
- Install canônico: `npm install`

Próximo passo operacional: CG-17 (remover lockfile não oficial — feito ao deletar `yarn.lock`).
