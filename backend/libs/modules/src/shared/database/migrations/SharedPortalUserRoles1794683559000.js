import { Table, TableColumn, } from 'typeorm';
export class SharedPortalUserRoles1794683559000 {
    name = 'SharedPortalUserRoles1794683559000';
    async up(queryRunner) {
        if (!(await queryRunner.hasTable('users'))) {
            await queryRunner.createTable(new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'name', type: 'varchar', length: '255' },
                    { name: 'email', type: 'varchar', length: '255', isUnique: true },
                    { name: 'password', type: 'varchar', length: '255' },
                    { name: 'roles', type: 'json' },
                ],
            }));
            return;
        }
        if (!(await queryRunner.hasColumn('users', 'roles'))) {
            await queryRunner.addColumn('users', new TableColumn({ name: 'roles', type: 'json', isNullable: true }));
        }
        await queryRunner.query("UPDATE `users` SET `roles` = JSON_ARRAY('student') WHERE `roles` IS NULL");
        await queryRunner.changeColumn('users', 'roles', new TableColumn({ name: 'roles', type: 'json', isNullable: false }));
    }
    async down(queryRunner) {
        if ((await queryRunner.hasTable('users')) &&
            (await queryRunner.hasColumn('users', 'roles'))) {
            await queryRunner.dropColumn('users', 'roles');
        }
    }
}
//# sourceMappingURL=SharedPortalUserRoles1794683559000.js.map