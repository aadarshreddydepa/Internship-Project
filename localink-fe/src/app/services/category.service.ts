import { Injectable } from '@angular/core';

export interface Category {
id: string;
name: string;
icon: string;
}

@Injectable({
providedIn: 'root'
})
export class CategoryService {

private categories: Category[] = [

{
id:'medical',
name:'Medical',
icon:`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="#1C1C1C" stroke-width="2" viewBox="0 0 24 24">
<path d="M12 2v20M2 12h20"/>
</svg>`
},

{
id:'food',
name:'Food & Dining',
icon:`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="#1C1C1C" stroke-width="2" viewBox="0 0 24 24">
<path d="M4 2v20M10 2v20M16 6v16"/>
</svg>`
},

{
id:'general',
name:'General Store',
icon:`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="#1C1C1C" stroke-width="2" viewBox="0 0 24 24">
<circle cx="9" cy="21" r="1"/>
<circle cx="20" cy="21" r="1"/>
<path d="M1 1h4l2.7 13h11.3l3-8H6"/>
</svg>`
},

{
id:'tutoring',
name:'Tutoring',
icon:`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="#1C1C1C" stroke-width="2" viewBox="0 0 24 24">
<path d="M22 10l-10-5-10 5 10 5 10-5z"/>
<path d="M6 12v5c3 2 9 2 12 0v-5"/>
</svg>`
},

{
id:'repair',
name:'Repair Services',
icon:`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="#1C1C1C" stroke-width="2" viewBox="0 0 24 24">
<path d="M14.7 6.3a4 4 0 1 0 3 3L22 14l-4 4-4-4 4-4z"/>
</svg>`
},

{
id:'home',
name:'Home & Garden',
icon:`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="#1C1C1C" stroke-width="2" viewBox="0 0 24 24">
<path d="M3 12l9-9 9 9"/>
<path d="M9 21V9h6v12"/>
</svg>`
}

];

getCategories(){
return this.categories;
}

}