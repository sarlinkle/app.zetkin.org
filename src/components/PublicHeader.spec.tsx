import { mountWithProviders } from '../utils/testing';
import PublicHeader from './PublicHeader';
import { ZetkinOrganization } from '../interfaces/ZetkinOrganization';

describe('PublicHeader', () => {

    const dummyUser = {
        first_name: 'Firstname',
        id: 100,
        last_name: 'Lastname',
        username: 'Username',
    };

    it('contains a login button when not logged in', () => {
        mountWithProviders(<PublicHeader user={ null } />);
        cy.contains('misc.publicHeader.login');
    });

    it('contains no login button when logged in', () => {
        mountWithProviders(<PublicHeader user={ dummyUser }/>);
        cy.contains('misc.publicHeader.login').should('not.exist');
    });

    it('contains user name if logged in', () => {
        mountWithProviders(<PublicHeader user={ dummyUser }/>);
        cy.contains(`${dummyUser.first_name} ${dummyUser.last_name}`);
    });

    it('contains user avatar if logged in', () => {
        mountWithProviders(<PublicHeader user={ dummyUser }/>);
        cy.get('[data-test="user-avatar"]').should('be.visible');
    });

    it('contains logout button if logged in', () => {
        mountWithProviders(<PublicHeader user={ dummyUser } />);
        cy.get('[data-test="logout-button"]').should('be.visible');
    });

    it('contains a zetkin logo when component has no org prop', () => {
        mountWithProviders(<PublicHeader user={ dummyUser }/>);
        cy.get('[data-test="zetkin-logotype"]').should('be.visible');
    });

    it('contains org avatar instead of zetkin logo when component has an org prop', () => {
        cy.fixture('dummyOrg.json')
            .then((data : ZetkinOrganization) => {
                mountWithProviders(<PublicHeader org={ data } user={ dummyUser }/>);

                cy.get('[data-test="zetkin-logotype"]').should('not.exist');
                cy.get('[data-test="org-avatar"]').should('be.visible');
            });
    });
}); 
