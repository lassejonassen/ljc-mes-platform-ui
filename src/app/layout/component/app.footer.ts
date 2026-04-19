import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        LJT-MES Platform by
        <a href="https://github.com/lassejonassen" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Lasse Jonassen</a>
    </div>`
})
export class AppFooter {}
