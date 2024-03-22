import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            log: [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'stdout',
                    level: 'error',
                },
                {
                    emit: 'stdout',
                    level: 'info',
                },
                {
                    emit: 'stdout',
                    level: 'warn',
                },
            ],
        });
    }
    /**
     * Initializes the module.
     *
     * @returns {Promise<void>} Promise that resolves when the module is initialized.
     */
    async onModuleInit(): Promise<void> {
        // this.$extends({
        //     model: {
        //         $allModels: {
        //             async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
        //                 const context = Prisma.getExtensionContext(this);
        //                 const result = await (context as any).findFirst({ where });
        //
        //                 return null !== result;
        //             },
        //         },
        //     },
        // });

        this.$on('query' as never, (event: Prisma.QueryEvent) => {
            console.log('\x1b[36m', `Query: ${event.query}`);
            console.log('\x1b[35m', `Params: ${event.params}`);
            console.log('\x1b[32m', `Duration: ${event.duration}ms`);
        });

        await this.$connect();
    }

    /**
     * Closes the connection to the database when the module is being destroyed.
     *
     * @returns {Promise<void>} A promise that resolves when the disconnection is successful.
     */
    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
    }
}
