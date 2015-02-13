/*
Todo:
mehrmals auf "weitere" hängt SVG an
Umlaute
Positioning of numbers - wie berechne ich jeweils den Minimumwert der "vergleich" Zahlen. Davon
möchte ich die Position berechnen.
Oder: wie mache ich ein Hintergrund-Kastl?
Komma statt Punkt 
DONE: correct size for orf screens (Ö1 und ORF.at)
ORF.at: 
max. 800 breit, 326 hoch (aber geht auch mehr)
http://orf.at/wahl/nr13/ergebnisse/#ergebnisse
Ö1:
max 779 breit
996 hoch (aber da geht auch)
http://oe1.orf.at/artikel/374311
*/
function bla(){

  var margin = {top: 10, right: 10, bottom: 30, left: 80,},
    width = 735 - margin.left - margin.right;
    height = 150 - margin.top - margin.bottom;

  //ordinal scale for "verfahren"
  var y = d3.scale.ordinal()
    .rangeRoundBands([20, height]); //f. abstand zw. Balken & Abstand zur Jahreszahl
    //.rangeRoundBands([0, height], 0.1, 0);

  //linear scale for "mandate"
  var x = d3.scale.linear()
    .range([0, 500]); //

  //to assign party colors. Could also be done with an ordinal scale
  var color = {"SPO":"#d41328", "OVP": "#060000", "FPO":"#2453a1", "Grune": "#84b414"};

  //tooltip - mainly for debugging, not really necessary
  var tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-5, 20])
    .html( function(d){return "<text>"+ d.name + ":"+ (d.x1-d.x0) +" Mandate"+ "</text>" });
  
  var button = d3.select('body')
    .append( 'button' )
    .text( 'Vergleich' )
    .attr("class","button");
  
  var button1 = d3.select("body")
    .append("button")
    .text("Weitere Wienwahlen")
    .attr("class", "button1")

    //add svg
  var svg = d3.select("body").append("svg")
    .attr("width", width  + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom )
    .append("g")
    .attr("transform", "translate(" + 87 + ","+ 38 + ")");

  svg.append("text")
    .text("2010")
    .style("fill", "black")
      .attr("x", 5)
      .attr("y", -13) //handle for distance between first bar and year
      .attr("class", "heading")

  //call tip
  //svg.call(tip);

  //add the data
  d3.tsv("2010_neu.tsv", function(error, data){

    var partei = ( d3.keys( data[0]).filter( function(key){return key !== "verfahren"; } ) );

    data.forEach(function(d){
      x0 = 0;
      d.mandate = partei.map(function(name){ return {name: name, verfahren: d.verfahren, x0: x0, x1: x0 += +d[name]} });
    })

    //set domains
    y.domain(data.map(function(d){return d.verfahren; }) );
    x.domain([0, 100 ]); //100 Mandate


    //create goups for verfahren and position them
    var verfahren = svg.selectAll(".verfahren")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "g")
      .attr("transform", function(d){ return "translate(0," +y(d.verfahren)+")" });

    //create group for rects
    verfahren.selectAll("rectgroup")
      .data(function(d){ return d.mandate; })
      .enter()
      .append("g")
      .attr("class", "rect")
      //set the x attribute to a fixed value according to party
      .attr("transform", function(d){
        switch(d.name){
          case "SPO":
            return "translate (" + x(d.x0) + ", 0)"
            break;
          case "OVP":
            return "translate (" + x(58) + ",0)"
            break;
          case "Grune":
            return "translate (" + x(80) + ",0)" 
            break;
          case "FPO":
            return "translate (" + x(99) + ",0)" 
        }
      })
      .append("rect")
      .classed('eins', function(d) { return d.verfahren === 'eins'; } )
      .classed('vergleich', function(d) { return d.verfahren !== 'eins' && d.verfahren !== 'stimmen'; } )
      .classed("stimmen", function(d){ return d.verfahren == "stimmen"; })
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
      
      verfahren.selectAll(".rect")
      .append("text")
      //.text(function(d){ return (d.x1-d.x0); })
        .classed('eins', function(d) { return d.verfahren === 'eins'; } )
        .classed('vergleich', function(d) { return d.verfahren !== 'eins' && d.verfahren !== 'stimmen'; } )
        .classed("stimmen", function(d){ return d.verfahren == "stimmen"; })

    function reveal( what ) {
      
      verfahren.selectAll('rect.' + what)
      .transition().duration(2500)
      .each("end", function(d){ 
          verfahren.selectAll("text." + what)
            .text(function(d){ 
              if(d.verfahren == "stimmen"){
                return d.name + ": " + d3.round((d.x1-d.x0), 2) + " % ";
              }else{
                return (d.x1-d.x0);
              }
            })
            .style("fill", function(d){
                if(d.verfahren == "eins"){
                  return "white"
                }else{
                  return "black"
                }
            })
            .attr("x", function(d){ 
              if(d.verfahren == "stimmen"){
                x(d.x0);
              }else if (d.verfahren == "eins"){
                return (x(d.x1-d.x0)-17);
              }else{
                return (x(d.x1-d.x0)-17);
                // evtl: Array aller Mandate einer Partei 
                //x(kleinster Wert)
              }
            })
            .attr("y", function(d){
              if(d.verfahren == "stimmen"){
                return -9;
              }else{
                return -3;
              }
            });
      })

      //set the height according to "verfahren"
      .attr("height", function(d){
          if(d.verfahren == "eins"){
            return 16;
          }else if(d.verfahren =="stimmen"){
            return 6;
          }else{
            return 2;
          }
      })
      .attr("width", function(d) { return x(d.x1)-x(d.x0); })
      .style("fill", function(d){ return color[d.name] })
      .style("fill-opacity", function(d){
          if(d.verfahren == "stimmen"){
            return "0.5";
          }else{
            return "1";
          }
            
        })
      .attr( "transform", function(d){ //move 2nd bar to top, so space is evenly distributed
          if(d.verfahren == "eins"){
            return "translate(0," + -14 + ")";
          }else if(d.verfahren == "stimmen"){
            return "translate(0," + -7 + ")"; //move 1st bar a bit mor to the top
          }
        })
    }
    
    reveal( 'eins' );
    reveal('stimmen');
    reveal('stimmen');

    button.on("click", function( ) {
      reveal( 'vergleich' );
    } );

      //add labels for verfahren
      verfahren.append("text")
      .text(function(d){
        switch(d.verfahren){
          case "stimmen":
            return "Stimmen"
            break;
          case "eins":
            return "Mandate"
            break;
          case "n":
            return "ohne (+0)"
            break;
          case "n5":
            return "ab 2020 (+0,5)"
            break;
          case "n6":
            return "2015 (+0,6)"
          case "n75":
            return "Vorschlag (+0,75)"
        }
      })
      .style("fill", "black")
      .attr("x", -5)
      .attr("dy", "0.1em")
      .attr("text-anchor", "end");

    d3.select(".button1").on("click", function(){
      reveal("vergleich"),
      weitere( "2005.tsv" );
      weitere( "2001.tsv" );
      weitere( "1996.tsv" );
    });

  });
  
}

bla();

//function to call other three charts
function weitere( file ){
  var margin = {top: 10, right: 10, bottom: 30, left: 80,},
    width = 735 - margin.left - margin.right;
    height = 150 - margin.top - margin.bottom;

  //ordinal scale for "verfahren"
  var y = d3.scale.ordinal()
    .rangeRoundBands([20, height]); //schalter f. abstand zw. Balken & Abstand zur Jahreszahl

  //linear scale for "mandate"
  var x = d3.scale.linear()
    .range([0, 500]); //
  
  //to assign party colors. Could also be done with an ordinal scale
  var color = {"SPO":"#d41328", "OVP": "#060000", "FPO":"#2453a1", "Grune": "#84b414", "LIF": "#f8d323"};

  //tooltip - mainly for debugging
  var tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-10, 20])
    .html( function(d){return "<text>"+ d.name + ":"+ (d.x1-d.x0) +" Mandate"+ "</text>" });

    //add svg
  var svg = d3.select("body").append("svg")
    .attr("width", width  + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom )
    .append("g")
    .attr("transform", "translate(" + 87 + ","+ 38 + ")");

  svg.append("text")
    .text( function(d){
      switch(file){
        case "2005.tsv":
          return "2005"
          break;
        case "2001.tsv":
          return "2001"
          break;
        case "1996.tsv":
          return "1996"
      }
    })
    .style("fill", "black")
      .attr("x", 5)
      .attr("y", -13) //handle for distance between first bar and year
      .attr("class", "heading")

  //call tip
  //svg.call(tip);
  
  //add the data
  d3.tsv( file, function(error, data){
    var partei = ( d3.keys( data[0]).filter( function(key){return key !== "verfahren"; } ) );

    data.forEach(function(d){
      x0 = 0;
      d.mandate = partei.map(function(name){ return {name: name, verfahren: d.verfahren, x0: x0, x1: x0 += +d[name]} });
    })

    //set domains
    y.domain(data.map(function(d){return d.verfahren; }) );
    x.domain([0, 100 ]); //100 Mandate

    //create goups for verfahren and position them
    var verfahren = svg.selectAll(".verfahren")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "g")
      .attr("transform", function(d){ return "translate(0," +y(d.verfahren)+")" });

    //create group for rects
    verfahren.selectAll("rectgroup")
      .data(function(d){ return d.mandate; })
      .enter()
      .append("g")
      .attr("class", "rect")
      //set the x attribute to a fixed value according to party
      .attr("transform", function(d){
        switch(d.name){
          case "SPO":
            return "translate (" + x(d.x0) + ", 0)"
            break;
          case "LIF":
            return "translate (" + x(45) + ", 0)"
          case "OVP":
            return "translate (" + x(58) + ",0)"
            break;
          case "Grune":
            return "translate (" + x(80) + ",0)" 
            break;
          case "FPO":
            return "translate (" + x(99) + ",0)" 
        }
      })
      .append("rect")
      .classed('eins', function(d) { return d.verfahren === 'eins'; } )
      .classed('vergleich', function(d) { return d.verfahren !== 'eins' && d.verfahren !== 'stimmen'; } )
      .classed("stimmen", function(d){ return d.verfahren == "stimmen"; })
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
   
    //create bars
    verfahren.selectAll(".rect")
      .append("text")
        .classed('eins', function(d) { return d.verfahren === 'eins'; } )
        .classed('vergleich', function(d) { return d.verfahren !== 'eins' && d.verfahren !== 'stimmen'; } )
        .classed("stimmen", function(d){ return d.verfahren == "stimmen"; })

    function reveal( what ) {
      verfahren.selectAll('rect.' + what)
      .transition().duration(2500)
      .each("end", function(d){ 
          verfahren.selectAll("text." + what)
            .text(function(d){ 
              if(d.verfahren == "stimmen"){
                return d.name + ": " + d3.round((d.x1-d.x0), 2) + " % ";
              }else{
                return (d.x1-d.x0);
              }
            })
            .style("fill", function(d){
                if(d.verfahren == "eins"){
                  return "white"
                }else{
                  return "black"
                }
            })
            .attr("x", function(d){ 
              if(d.verfahren == "stimmen"){
                x(d.x0);
              }else if (d.verfahren == "eins"){
                return (x(d.x1-d.x0)-17);
              }else{
                return (x(d.x1-d.x0)-17);
                //evtl. s.o.
              }
            })
            .attr("y", function(d){
              if(d.verfahren == "stimmen"){
                return -9;
              }else{
                return -3;
              }
            });
      })

      //set the height according to "verfahren"
      .attr("height", function(d){
        if(d.verfahren == "eins"){
          //return y.rangeBand()/2 ;
          return 16;
        }else if(d.verfahren =="stimmen"){
          return 6;
        }else{
          return 2;
        }
      })
      .attr("width", function(d) { return x(d.x1)-x(d.x0); })
      .style("fill", function(d){ return color[d.name] })
      .style("fill-opacity", function(d){
        if(d.verfahren == "stimmen"){
          return "0.5";
        }else{
          return "1";
        } 
      })
      .attr( "transform", function(d){ //move 1st bar to top, so space is evenly distributed
        if(d.verfahren == "eins"){
          return "translate(0," + -14 + ")";
        }else if(d.verfahren == "stimmen"){
          return "translate(0," + -7 + ")"; //move 2nd bar a bit mor to the top
        }
      })
    }
    
    
    reveal( 'eins' );
    reveal( "vergleich" );
    reveal('stimmen');


    //add labels for verfahren
    verfahren.append("text")
      .text(function(d){
        switch(d.verfahren){
          case "stimmen":
            return "Stimmen"
            break;
          case "eins":
            return "Mandate"
            break;
          case "n":
            return "ohne (+0)"
            break;
          case "n5":
            return "ab 2020 (+0,5)"
            break;
          case "n6":
            return "2015 (+0,6)"
          case "n75":
            return "Vorschlag (+0,75)"
        }
      })
      .style("fill", "black")
      .attr("x", -5)
      .attr("dy", "0.1em")
      .attr("text-anchor", "end");

    });

  }