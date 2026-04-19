import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
    providers: [MessageService],
    selector: 'app-wage-group-dialog',
    imports: [],
    templateUrl: './wage-group-dialog.html',
    styleUrl: './wage-group-dialog.scss'
})
export class WageGroupDialog {}
