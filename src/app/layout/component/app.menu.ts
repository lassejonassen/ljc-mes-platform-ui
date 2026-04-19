import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',

                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Orders',
                items: [
                    { label: 'Work Orders', icon: 'pi pi-fw pi-list', routerLink: ['/orders/work-orders'] },
                    { label: 'Import CSV', icon: 'pi pi-fw pi-list', routerLink: ['/orders/import'] }
                ]
            },
            {
                label: 'Production',
                icon: 'pi pi-fw pi-list',
                path: '/production',
                items: [
                    { label: 'Product Types', icon: 'pi pi-fw pi-list', routerLink: ['/production/product-types'] },
                    {
                        label: 'Production Lines',
                        icon: 'pi pi-fw pi-list',
                        path: '/production-lines',
                        items: [
                            {
                                label: 'Lines',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/production/production-lines']
                            },
                            {
                                label: 'Statuses',
                                icon: 'pi pi-fw pi-times-circle',
                                routerLink: ['/production/production-line-statuses']
                            }
                        ]
                    },
                    { label: 'Issues', icon: 'pi pi-fw pi-list', routerLink: ['/production/issues'] },
                    { label: 'Companies', icon: 'pi pi-fw pi-list', routerLink: ['/production/companies'] },
                    { label: 'Anomaly Reasons', icon: 'pi pi-fw pi-list', routerLink: ['/production/anomaly-reasons'] },
                    { label: 'Shifts', icon: 'pi pi-fw pi-list', routerLink: ['/production/shits'] }
                ]
            },
            {
                label: 'Modelling',
                items: [
                    { label: 'Factories', icon: 'pi pi-fw pi-list', routerLink: ['/modelling/factories'] },
                    { label: 'Divisions', icon: 'pi pi-fw pi-list', routerLink: ['/modelling/divisions'] },
                    { label: 'Workstation Types', icon: 'pi pi-fw pi-list', routerLink: ['/modelling/workstation-types'] },
                    { label: 'Subassemblies', icon: 'pi pi-fw pi-list', routerLink: ['/modelling/subassemblies'] }
                ]
            },
            {
                label: 'HR',
                items: [
                    { label: 'Operators', icon: 'pi pi-fw pi-list', routerLink: ['/hr/operators'] },
                    { label: 'Teams', icon: 'pi pi-fw pi-list', routerLink: ['/hr/teams'] },
                    { label: 'Skills', icon: 'pi pi-fw pi-list', routerLink: ['/hr/skills'] },
                    { label: 'Wage Groups', icon: 'pi pi-fw pi-list', routerLink: ['/hr/wage-groups'] }
                ]
            },
            {
                label: 'Maintenance',
                items: [
                    { label: 'Events', icon: 'pi pi-fw pi-list', routerLink: ['/maintenance/events'] },
                    { label: 'Tools', icon: 'pi pi-fw pi-list', routerLink: ['/maintenance/tools'] },
                    { label: 'Cost Sources', icon: 'pi pi-fw pi-list', routerLink: ['/maintenance/cost-sources'] },
                    { label: 'Anomalies', icon: 'pi pi-fw pi-list', routerLink: ['/maintenance/anomalies'] }
                ]
            },
            {
                label: 'Connectivity',
                items: [
                    { label: 'Overview', icon: 'pi pi-fw pi-list', routerLink: ['/connectivity/overview'] },
                    { label: 'MQTT', icon: 'pi pi-fw pi-list', routerLink: ['/connectivity/mqtt'] }
                ]
            },
            {
                label: 'Admin',
                items: [
                    { label: 'Users', icon: 'pi pi-fw pi-list', routerLink: ['/admin/users'] },
                    { label: 'Reports', icon: 'pi pi-fw pi-list', routerLink: ['/admin/reports'] },
                    { label: 'Audit Logs', icon: 'pi pi-fw pi-list', routerLink: ['/admin/audit-logs'] }
                ]
            },
            {
                label: 'UI Components',
                items: [
                    { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
                    { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
                    { label: 'Button', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/uikit/button'] },
                    { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
                    { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
                    { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
                    { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
                    { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
                    { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
                    { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
                    { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
                    { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
                    { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
                    { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
                    { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] }
                ]
            },
            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                path: '/pages',
                items: [
                    {
                        label: 'Landing',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/landing']
                    },
                    {
                        label: 'Auth',
                        icon: 'pi pi-fw pi-user',
                        path: '/auth',
                        items: [
                            {
                                label: 'Login',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/auth/login']
                            },
                            {
                                label: 'Error',
                                icon: 'pi pi-fw pi-times-circle',
                                routerLink: ['/auth/error']
                            },
                            {
                                label: 'Access Denied',
                                icon: 'pi pi-fw pi-lock',
                                routerLink: ['/auth/access']
                            }
                        ]
                    },
                    {
                        label: 'Crud',
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: ['/pages/crud']
                    },
                    {
                        label: 'Not Found',
                        icon: 'pi pi-fw pi-exclamation-circle',
                        routerLink: ['/pages/notfound']
                    },
                    {
                        label: 'Empty',
                        icon: 'pi pi-fw pi-circle-off',
                        routerLink: ['/pages/empty']
                    }
                ]
            },
            {
                label: 'Hierarchy',
                path: '/hierarchy',
                items: [
                    {
                        label: 'Submenu 1',
                        icon: 'pi pi-fw pi-bookmark',
                        path: '/hierarchy/submenu_1',
                        items: [
                            {
                                label: 'Submenu 1.1',
                                icon: 'pi pi-fw pi-bookmark',
                                path: '/hierarchy/submenu_1/submenu_1_1',
                                items: [
                                    { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: 'Submenu 1.2',
                                icon: 'pi pi-fw pi-bookmark',
                                path: '/hierarchy/submenu_1/submenu_1_2',
                                items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    },
                    {
                        label: 'Submenu 2',
                        icon: 'pi pi-fw pi-bookmark',
                        path: '/hierarchy/submenu_2',
                        items: [
                            {
                                label: 'Submenu 2.1',
                                icon: 'pi pi-fw pi-bookmark',
                                path: '/hierarchy/submenu_2/submenu_2_1',
                                items: [
                                    { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: 'Submenu 2.2',
                                icon: 'pi pi-fw pi-bookmark',
                                path: '/hierarchy/submenu_2/submenu_2_2',
                                items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Recipe Management',
                path: '/recipe-management',
                items: [
                    {
                        label: 'Material Definitions',
                        path: '/recipe-management/material-definitions',
                        routerLink: ['/recipe-management/material-definitions'],
                        icon: 'pi pi-fw pi-bookmark'
                    },
                    {
                        label: 'Process Segments',
                        path: '/recipe-management/process-segments',
                        routerLink: ['/recipe-management/process-segments'],
                        icon: 'pi pi-fw pi-bookmark'
                    },
                    {
                        label: 'Product Segments',
                        path: '/recipe-management/product-segments',
                        routerLink: ['/recipe-management/product-segments'],
                        icon: 'pi pi-fw pi-bookmark'
                    }
                ]
            },
            {
                label: 'Get Started',
                items: [
                    {
                        label: 'Documentation',
                        icon: 'pi pi-fw pi-book',
                        routerLink: ['/documentation']
                    },
                    {
                        label: 'View Source',
                        icon: 'pi pi-fw pi-github',
                        url: 'https://github.com/primefaces/sakai-ng',
                        target: '_blank'
                    }
                ]
            }
        ];
    }
}
