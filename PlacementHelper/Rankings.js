class PlacementRankings {
	constructor() {
		this.placements = new Set();
		this.unplaced = new Set();
		this.allPeople = new Set();
		this.placed = new Set();
		this.structure = new Map();
		this.maxRank = 1;
    }

    loadRoles(roleList){
        roleList.forEach(element => {
            const temp = new Role(element[0],element[1],element[2], parseInt(element[3]));
            this.placements.add(temp);
            let currCouncil = null;
            if(this.structure.has(element[0])){
                currCouncil = this.structure.get(element[0]);
            }
            else {
                currCouncil = new Map();
                this.structure.set(element[0],currCouncil);
            }

            let commit = null;
            if(currCouncil.has(element[1])){
                commit = currCouncil.get(element[1])
            }
            else {
                commit = new Map();
                currCouncil.set(element[1],commit);
            }
            if(!commit.has(element[2])) {
                commit.set(element[2],temp);
            }
        });
    }

	findRole(pos){
		for (let r of this.placements){
			if(pos==r.getPosition()){
				return r;
			}
        }
		return null;
	}

	loadRankings(ranks)	 {
        ranks.forEach(element => {
                this.unplaced.add(element[0]);
                this.allPeople.add(element[0]);
                let temp = this.findRole(element[1]);
				if(temp !== null){
					temp.addInterest(element[0],parseInt(element[2]));
					if(parseInt(element[2])>this.maxRank){
						this.maxRank = parseInt(element[2]);
					}
                }
                else {
                    let str = element[0]+" applied for "+element[1]+" which is not in the roles file";
                    alert(str);
                }
                
        });
        this.display();
    }

    display() {
        let str = "";
        for (const key of this.structure.keys()){
            str+="<h2>"+key+"</h2>"
			let committees = this.getCommittees(key);
        	committees.forEach((comm,pos) => {
           		str+=this.displayCommittee(key,comm);
        	});
        }
		str+=this.getDropDowns();
        return str;
    }

	getDropDowns(){
		let str = "<hr><h2>Assign a Placment</h2>";
		str+='<p><label for="person">Person</label><select name="person" id="person"><option value="">--Please choose an Person--</option>';
		for (const entry of this.unplaced) {
			str+='<option value="'+entry+'">'+entry+'</option>';
        }
		str+='</select><br>';
		str+='<label for="pos">Placement</label><select name="pos" id="pos"><option value="">--Please choose a Placement--</option>';
		for (const entry of this.placements) {
			if(entry.spotsAvailable()>0){
				str+='<option value="'+entry.getPosition()+'">'+entry.getPosition()+'</option>';
			}
        }
		str+='</select></p>';
		str+='<p><button onclick="Assign(person.value,pos.value)">Assign Placement</button></p>';
		str+= "<h2>Remove a Placment</h2>";
		str+='<p><label for="pers">Person</label><select name="pers" id="pers"><option value="">--Please choose an Person--</option>';
		for (const entry of this.placed) {
			str+='<option value="'+entry+'">'+entry+'</option>';
        }
		str+='</select></p>';
		str+='<p><button onclick="Remove(pers.value)">Remove Placement</button></p>';
		return str;
	}


    displayCommittee(council, committee) {
        let str="<h3>"+committee+"</h3>";
        const thePos = this.getRoles(council,committee);
        str+="<table><tr><td><b>Position</b></td><td><b>Placed</b></td>";
		for(let i = 1; i<=this.maxRank; i++){
			str+="<td><b>Rank "+i+"</b></td>"
		}
        str+="</tr>";
        thePos.forEach(pos => {
            str+=this.structure.get(council).get(committee).get(pos).displayRole(this.maxRank);
        })
        str+="</table>";
        return str;
    }

	assignPlacement(name, position) {
		if(this.unplaced.has(name)){
			this.unplaced.delete(name);
			this.placed.add(name);
			let temp = this.findRole(position);//this.structure.get(council).get(committee).get(position);
			temp.assignPerson(name); 
			this.placements.forEach(r => {
				r.removePerson(name);
			});
		}
		else {
			alert(name+" has already been placed");
		}
	}
	
	removePlacement(name) {
		if(this.placed.has(name)){
			this.unplaced.add(name);
			this.placed.delete(name);
			this.placements.forEach(r => {
            	r.addPersonBack(name);
            	r.unplace(name);
        	});
		}
	}

	// getCouncils(){
	// 	return this.structure.keys();
	// }
	
	getCommittees(council){
		return (this.structure.get(council).keys());
	}
    
	getRoles(council, committee){
		return this.structure.get(council).get(committee).keys();
	}
	
	// getRole(council, committee, position) {
	// 	return this.structure.get(council).get(committee).get(position);
	// }

    getInterest(council, committee, position, rank) {
		const actualRole = this.getRole(council, committee, position);
		return actualRole.getPeopleWithRanking(rank);
	}

    getInterestRemoved(council, committee, position, rank) {
		const actualRole = this.getRole(council, committee, position);
		return actualRole.getRemovedPeopleWithRanking(rank);
	}

    getUnplaced() {
		return this.unplaced;
	}
	
}

class Role {

    constructor(council, committee, position, count) {
        this.council = council;
        this.committee = committee;
		this.position = position;
		this.numSpots = count;

        this.filled = new Set();
		this.removed = new Map();
		this.interested = new Map();
		for(let i = 1; i<=10; i++) {
			this.interested.set(i, new Set());
            this.removed.set(i, new Set());
		}
    }
    
	getCouncil() {
		return this.council;
	}

	getCommittee() {
		return this.committee;
	}

	getPosition() {
		return this.position;
	}

	getFilled() {
		return this.filled;
	}

	spotsAvailable() {
		return this.numSpots-this.filled.size;
	}
	
	// interestedReport() {
	// 	String s = "";
	// 	for(int i = 1; i<=7; i++) {
	// 		if(this.interested.get(i).size()>0) {
	// 			s += i+": "+this.interested.get(i).toString().substring(1, this.interested.get(i).toString().length()-1)+"\n";
	// 		}
	// 	}
	// 	return s;
	// }
	
	numInterested() {
		let count = 0;
		for(let i = 1; i<=10; i++) {
			count += this.interested.get(i).size;
		}
		return count;
	}
	
	getAllInterested() {
		const names = new Set();
		for(let i=1; i<=10; i++) {
            // Get all Values
            const myIterator = this.interested.get(i).values();

            for (const entry of myIterator) {
                names.add(entry);
            }
		}
		return names;
	}
	
	getPeopleWithRanking(rank){
		return this.interested.get(rank);
	}

	getRemovedPeopleWithRanking(rank){
		return this.removed.get(rank);
	}
	
	assignPerson(name) {
		this.filled.add(name);
	}

    displayRole(numShow) {
        let str = "<tr";
		if(this.spotsAvailable()<=0){
			str+= " style='background-color: lightgray;'"
		}
		str+="><td>"+this.position+"</td>";
		let count = 1;
		str+="<td><ol>";
        for (const entry of this.filled) {
			str+="<li>"+entry+"</i>";
			count++;
        }
		for(let j = count; j<=this.numSpots;j++){
			str+="<li> </li>"
		}
		str += "</ol></td>";
        // str += "<td>"+Array.from(this.filled).join("\n")+"</td>";
        for(let i = 1; i<=numShow; i++) {
            const ppl = this.getPeopleWithRanking(i);
            const pplPlacedElsewhere = this.getRemovedPeopleWithRanking(i);
            str+="<td>"+Array.from(ppl).join("<br>");
            str+="<s>"+Array.from(pplPlacedElsewhere).join("\n")+"</s>";
            str += "</td>";
        }
        str+="</tr>";
        return str;   
    }
	
	removePerson(name) {
		for(let i = 1; i<=8; i++) {
			if(this.interested.get(i).has(name)) {
				this.interested.get(i).delete(name);
				this.removed.get(i).add(name);
			}
		}
	}
	
	unplace(name) {
		this.filled.delete(name);
	}
	
	addPersonBack(name) {
        for(let i = 1; i<=8; i++) {
            if(this.removed.get(i).has(name)) {
                this.removed.get(i).delete(name);
                this.interested.get(i).add(name);
            }
        }
	}
	
	addInterest(name, rank) {
		this.interested.get(rank).add(name);
	}
	 //return true if comes first
	comesBefore(other) {
		if(this.council !== other.council) {
			return this.council < other.council;
		}
		if(this.committee !== other.committee) {
			return this.committee < (other.committee);
		}
		if(this.position !==(other.position) && this.position.includes("vice")) {
			return true;
		}
		if(this.position !== (other.position) && other.position.includes("vice")) {
			return false;
		}
		if(this.position !== (other.position)) {
			return this.position < (other.position);
		}
		return false;
	}
}
