import { AfterViewInit,
         Component, 
         Inject,
         ViewChild }             from '@angular/core';

import { DOCUMENT }              from '@angular/common';

import { MenuController }        from '@ionic/angular';

import { AgmMap, MapsAPILoader } from '@agm/core';

import { Observable }            from 'rxjs';

import { FirestoreService }      from '@app-services/firestore.service';
import { Coffeeshop }            from '../../../interfaces/coffeeshop';


//TYPESCRIPT DECLARATION
declare const google: any;


@Component({
  selector: 'app-agm',
  templateUrl: './agm.component.html',
  styleUrls: ['./agm.component.scss']
})
export class AgmComponent implements AfterViewInit {

  @ViewChild(AgmMap) 
  public map: AgmMap;

  public lat: number = 43.1506;
  public lng: number = -87.9579;
  public zoom: number = 11;

  public locations: Observable<Coffeeshop[]>;

  constructor(@Inject(DOCUMENT) private document: Document, 
              private firestore: FirestoreService, 
              private mapsApiLoader: MapsAPILoader,
              private menuCtrl: MenuController) { }

  ngAfterViewInit() {
    //capture input text from template
    let input = <HTMLInputElement>this.document.getElementById('search');

    //load AGM MapAPI
    this.mapsApiLoader.load().then(() => {
      //fetch locations
      this.loadCoffeeshops();
      //set bounds
      this.setBounds();
      //initialize autocomplete
      this.initAutocomplete(input);
    });    
  }

  /** FETCH FIRESTORE LOCATIONS **/
  loadCoffeeshops(filter?: any) { this.locations = this.firestore.loadColectivo() }


  /** GOOGLE MAPS API METHODS **/
  setBounds() {
    const mapBounds = new google.maps.LatLngBounds();

    this.locations.forEach((coffeeshops: Coffeeshop[]) => {
      for (let shop of coffeeshops) {
        const latLng = new google.maps.LatLng(shop.latLng.lat, shop.latLng.lng);
        mapBounds.extend(latLng);
      }

      this.lat = mapBounds.getCenter().lat();
      this.lng = mapBounds.getCenter().lng();

      //console.log(`Bounds set\ncenter: { ${this.lat}, ${this.lng} }`)
    });
  }

  initAutocomplete(input: HTMLInputElement) {
    let autocomplete = new google.maps.places.Autocomplete(input, { types: ["address"] });

    google.maps.event.addListener(autocomplete, "place_changed", () => {
      //get the place result
      let place: google.maps.places.PlaceResult = autocomplete.getPlace();
      //verify result
      if (place.geometry === undefined || place.geometry === null)  return;

      this.lat = place.geometry.location.lat();
      this.lng = place.geometry.location.lng();
      this.zoom = 11;
    });
  }
  /** END GOOGLE MAPS API METHODS **/


  /** AGM-MAP, AGM-MARKER METHODS **/
  onMouseOver(shop: Coffeeshop) {
    this.firestore.updateLocation(shop); 
    this.menuCtrl.toggle();
  }
  /** END MARKER INFO WINDOW METHODS **/

  

  


}