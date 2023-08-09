import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import frete from 'frete'
import zod from 'zod'

const cep = zod.string()
    .min(8)
    .max(9)
    .transform(async (cep, ctx) => {
        if (cep.length == 9 && !cep.includes('-')) {
            ctx.addIssue({
                code: zod.ZodIssueCode.custom,
                message: 'Length > 8 without dash (-)'
            })
            return zod.NEVER
        }
        if (cep.length == 9 && cep.includes('-')) {
            return cep.replace(/-/g, '')
        }
        return cep
    })

const servico = zod.union([zod.literal(frete.servicos.sedex), zod.literal(frete.servicos.pac)])

const schema = zod.object({
    cepOrigem: cep,
    cepDestino: cep,
    servico,
    peso: zod.number().min(1).max(30).default(1),
    comprimento: zod.number().min(15).max(100).default(15),
    altura: zod.number().min(1).max(100).default(1),
    largura: zod.number().min(10).max(100).default(10),
})
    .refine(async ({ altura, comprimento, largura, cepOrigem, cepDestino }) => {
        if (cepOrigem == cepDestino) {
            return {
                message: `CEP's cannot be equals`,
                path: ['cepOrigem', 'cepDestino']
            }
        }
        if (altura + comprimento + largura > 100) {
            return {
                message: 'The sum of all dimensions cannot be greater than 100',
                path: ['altura', 'comprimento', 'largura']
            }
        }
    })

export async function GET(request: NextRequest) {
    return NextResponse.json({ hello: 'world' })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const parse = await schema.safeParseAsync(body)
    if (!parse.success) {
        return NextResponse.json({ error: parse.error })
    }
    if (parse.success) {
        const { altura, cepDestino, cepOrigem, comprimento, largura, peso, servico } = parse.data
        const response = await frete()
            .cepOrigem(cepOrigem)
            .peso(peso)
            .formato(frete.formatos.caixaPacote)
            .comprimento(comprimento)
            .altura(altura)
            .largura(largura)
            .diametro(1)
            .maoPropria("N")
            .valorDeclarado(0)
            .avisoRecebimento("N")
            .servico(servico)
            .preco(cepDestino)
        return NextResponse.json(response[0])
    }
    return NextResponse.json({ body })
}