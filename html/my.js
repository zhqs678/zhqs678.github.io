// This code translates a Python script to JavaScript, involving data structures and file writing.

let moves = "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. Ng5 O-O { 两连击 } 6. d3 (6. Nxf7 Rxf7 7. Bxf7+ Kxf7 { 交换后白吃亏 }) 6... h6 { 请马回家 } 7. h4 (7. Nf3 { 马回去 } 7... d5 8. exd5 Nxd5 9. O-O a6 { 阻止象 } 10. Re1 Nb6 11. Nxe5 { 吃兵对白方不利 } 11... Nxe5 12. Rxe5 Bxf2+ 13. Kxf2 Qf6+ 14. Qf3 Qxe5 { 黑优 }) 7... hxg5? { 陷阱 } (7... d6! { 黑方d6好棋,不应该吃马 } 8. Qe2! (8. Nf3 { 马跳回,浪费棋 } 8... Ne7! { 非常常见好棋 } 9. O-O Ng6 $17 { 黑大优 }) (8. Nd2 hxg5 9. hxg5 Ng4 $17 { 挡着后 }) (8. b4 Bb6 $17 9. a4 a5 $17) 8... Ne7! (8... hxg5 9. hxg5 Ng4 10. f3 { 黑马困境 }) 9. Nd2 (9. a4 { 白随意走 } 9... d5! 10. exd5 hxg5 11. hxg5 Ng4 12. f3 Nf5 13. fxg4 Ng3 $17 { 双击 }) 9... hxg5 10. hxg5 Ng4 11. f3 Ne3 { 马可以跳e3 }) 8. hxg5 Nh7 { 马不能逃 } 9. Qh5 Re8 10. Qxf7+ Kh8 11. Rxh7+ Kxh7 12. Qh5# { 格雷科将杀 } *"

// let moves = "1. d4 d5 2. c4 dxc4 3. e3 b5 4. a4 Bd7 (4... bxa4 5. Bxc4) (4... c6 5. axb5 cxb5 6. Qf3 { 抓死黑车 }) 5. axb5 Bxb5 6. Nc3 Ba6 7. Qf3 c6 8. Rxa6 Nxa6 9. Qxc6+ Qd7 10. Qxa8+ Qd8 11. Qc6+ Qd7 12. Qxa6 *";

// const match = san.match(/^([NBRQK])?([a-h])?([1-8])?[-x]?([a-h][1-8])(?:=?([nbrqkNBRQK]))?[+#]?$/);

// let regex = /([NBRQK])?([a-h])?([1-8])?[-x]?([a-h][1-8])/;

let regex = /([NBKRQ]?[a-h]?[1-8]?[\-x]?[a-h][1-8](?:=?[nbrqkNBRQK])?[+#!?]?[!]?[?]?|[PNBRQK]?@[a-h][1-8]|--|Z0|0000|@@@@|O-O(?:-O)?|0-0(?:-0)?)|(\{.*)|(;.*)|(\$[0-9]+)|(\()|(\))|(\*|1-0|0-1|1\/2-1\/2)|([\?!]{1,2})/;
let rex_head = /\[([A-Za-z0-9][A-Za-z0-9_+#=:-]*)\s+\"([^\r]*)\"\]\s*/;



var pgn_header = "";

// 实现子列表，没有对应父关系，准备改变方法
function Step() {
  this.id = 0;    //  //唯一ID
  this.cnt = 0; //分支内部计数
  this.move = "";    //
  this.parent = 0;
  this.comment = "";
  this.step = 0;    // 步数
  this.white = "";
  this.is_end = 0;  // 是否结束变着
}

function Variation() {
  // this.current_id = [];
  this.nodes = [];
  this.depth = 0;
}

function DoubleStep() {
    this.white;
    this.black;
}

function remove_header(pgns) {

  // var regex2 = /\[(.+?)\]/;
  var regex23 = /\"(.+?)\"/;
  var moves2 = "";

  var array = pgns.split("\n");

  for (i = 0; i < array.length; i++) {
    var line = array[i];
      
      if (line == null)
        continue;
      if (line.substring(0, 7) == "[Event ") {
        var events = regex23.exec(line);
        pgn_header = events[0];
        pgn_header = pgn_header.replace(/\"+/g, '');
      }
      if (line.substring(0, 2) == "1.") {
        moves2 = line;
        return moves2
      }
  }

  return null;

  // for (var i = 0; i < 20; i++) {
  //   var header = regex2.exec(pgns);

  //   if (header != null) {
  //     var line = header[0];

  //     if (line.search("Event") != -1) {
  //       var events = regex23.exec(line);
  //       pgn_header = events[0];
  //       // pgn_header = pgn_header.replace(/\s+/g, "");
  //       // pgn_header = pgn_header.replace(/\[+/g, '');
  //       // pgn_header = pgn_header.replace(/\]+/g, '');
  //       // pgn_header = pgn_header.replace(/Event+/g, '');
  //       pgn_header = pgn_header.replace(/\"+/g, '');
  //     }

  //     pgns = pgns.substr(header.index + header[0].length);
  //   } else {
  //     break;
  //   }
  // }

  // // pgn_header += pgns;
  // return pgns;
}


function moves2list(moves) {

  var double_steps = [];
  var moves_lists = [];

  var moves2 = moves;
  var variations = new Variation();
  var temp_node;  //进出栈的node，或者变着node
  var old_node; // 上一个node

  var start_vari = 0;   // 开始变着
  var end_vari = 0;     //结束变着

  let len = moves2.length;

  var in_cnt = 1; //分支内部计数
  var step_id = 1;  //唯一ID
  variations.depth = 0;

  for (let i = 0; i < len; i++) {

    const lists = regex.exec(moves2);

    if (lists == null) {
      break;
    }

    if (lists[0].substring(0, 1) == "{") {

      // 查找注释
      var comrex = /{(.+?)}/g;
      var comment = comrex.exec(moves2);

      // var cc = comment[0].replace(/\s+/g, "");
      var cc = comment[0];
      cc = cc.replace(/{+/g, '');
      cc = cc.replace(/}+/g, '');

      // cc = cc.replace(/,/g, ',\n');
      cc = cc.replace(/[^\x00-\xff]/g,"$&\x01").replace(/.{30}\x01?/g,"$&\n").replace(/\x01/g,"")

      if (temp_node != null) {
        temp_node.comment += cc;
      }

      moves2 = moves2.substr(comment.index + comment[0].length);

    } else if (lists[0].substring(0, 1) == "#") {
      if (temp_node != null) {
          temp_node.comment += lists[0];
        }
        moves2 = moves2.substr(lists.index + lists[0].length);
        continue;
    } else if (lists[0].substring(0, 1) == "+") {
      if (temp_node != null) {
          temp_node.comment += lists[0];
        }
        moves2 = moves2.substr(lists.index + lists[0].length);
        continue;
    } else if (lists[0].substring(0, 1) == ";") {
		if (temp_node != null) {
        temp_node.comment += lists[0];
      }
      moves2 = moves2.substr(lists.index + lists[0].length);
      continue;
    } else if (lists[0].substring(0, 1) == "$") {
		if (temp_node != null) {
        temp_node.comment += lists[0];
      }
      moves2 = moves2.substr(lists.index + lists[0].length);
      continue;
    } else if (lists[0].substring(0, 1) == "?") {
	  if (temp_node != null) {
        temp_node.comment += lists[0];
      }
      moves2 = moves2.substr(lists.index + lists[0].length);
      continue;
    } else if (lists[0].substring(0, 1) == "!") {
		if (temp_node != null) {
        temp_node.comment += lists[0];
      }
      moves2 = moves2.substr(lists.index + lists[0].length);
      continue;
    } else if (lists[0].substring(0, 1) == ";") {
		if (temp_node != null) {
        temp_node.comment += lists[0];
      }
      moves2 = moves2.substr(lists.index + lists[0].length);
      continue;
    } else if (lists[0].substring(0, 1) == "(") {

      moves2 = moves2.substr(lists.index + 1);

      variations.nodes.push(temp_node);

      variations.depth++;
      in_cnt = temp_node.cnt;
      start_vari = 1;
	  

      // console.log("push: " + temp_node.id + " " + temp_node.vari_depth + "-" + temp_node.cnt + " "+ temp_node.parent + "\r\n");
      // console.log("push: " + temp_node.id + " "+ temp_node.parent + "\r\n");

      continue;

    } else if (lists[0].substring(0, 1) == ")") {

      end_vari = 1;

      // 上一个是白棋走，只有一个白棋走
      if (temp_node.white == "white") {
        temp_node.is_end = 1;
        var dd = new DoubleStep();
        dd.white = temp_node; 

        var nnnn = new Step();
        nnnn.id = 9999;
        nnnn.move = "...";
        nnnn.parent = 9998;
        nnnn.white = "black";
        nnnn.comment = "";

        dd.black = nnnn;  // 黑棋未空
        double_steps.push(dd);
        // console.log("double: "+ dd.white.step + " " + dd.white.parent + " " + dd.black.id + " "
        //   + dd.white.move + " " + dd.black.move + "\r\n");
      }

      if (variations.depth > 0) {
        variations.depth--;
        temp_node = variations.nodes.pop();
        // console.log("pop: " + temp_node.id + " " + temp_node.vari_depth + "-" + temp_node.cnt + " "+ temp_node.parent + "\r\n");
        // console.log("pop: " + temp_node.id + " " + temp_node.parent + "\r\n");
        in_cnt = temp_node.cnt;
        in_cnt++;
      }
      moves2 = moves2.substr(lists.index + 1);
      // console.log("vari_depth sub: " + variations.depth + "\r\n");
      continue;

    } else {

      var node = new Step();
      node.id = step_id;
      // node.name = variations.depth.toString() + "-" + in_cnt.toString();

      node.move = lists[0];
      // node.vari_depth = variations.depth;
      node.cnt = in_cnt;
      node.step = parseInt((node.cnt + 1) / 2);

      if (step_id != 1)
        node.parent = old_node.id;

      if (node.id == 1) {
        node.white = "white";
      } else {
        if (temp_node.white == "white")
          node.white = "black";
        else
          node.white = "white";
      }

      if (end_vari) {     // 这两个顺序不能变，防止括号连续。
        // 这里的temp_node是上一个暂存的节点，
        // node结束上一个后，新的节点
        node.parent = temp_node.id;
        end_vari = 0;
        if (temp_node.white == "white")
          node.white = "black";
        else
          node.white = "white";
      }

      
      var have_add = 0; // 已经增加过了
      if (start_vari) {   // 这两个顺序不能变，防止括号连续。
        node.parent = temp_node.parent;
        start_vari = 0;
        node.white = temp_node.white;


        // 根据黑方走棋，增加一个双方都走的步骤
        if (node.white == "black") {
          var ppnode; // 找到上上个node，与这个形成一对
          for (var z = 0; z < moves_lists.length; z++) {
            if (moves_lists[z].id == temp_node.parent) {  // 上一个节点的父
              ppnode = moves_lists[z];
              break;
            }
          }
          if (ppnode != null) {
            var dd = new DoubleStep();
            dd.white = ppnode;
            dd.black = node;
            double_steps.push(dd);
            // console.log("pdouble: "+ dd.white.step + " " + dd.white.parent + " " + dd.black.id + " "
            //   + dd.white.move + " " + dd.black.move + "\r\n");
            have_add = 1;
          }
        }
      }

      moves_lists.push(node);

      // console.log(node.id +" "+ node.vari_depth +"-"+ node.cnt + " " + node.parent + " " + node.move + "\r\n");
      
      // console.log(node.id + " p:" + node.parent +  // " cnt:" + node.cnt + 
      //   " " + node.white + " step:" + node.step + " " + node.move + "\r\n");

      // console.log("push: " + node.id + " " + node.move + "\r\n");

      // 根据黑方走棋，增加一个双方都走的步骤
      if ((node.white == "black") && (have_add == 0)) {
        var dd = new DoubleStep();
        dd.white = temp_node;
        dd.black = node;
        double_steps.push(dd);

        // console.log("double: "+ dd.white.step + " " + dd.white.parent + " " + dd.black.id + " " 
        //   + dd.white.move + " " + dd.black.move + "\r\n");
        have_add = 0;
    }

      temp_node = node;
      old_node = node;

      in_cnt++;
      step_id++;
      
      moves2 = moves2.substr(lists.index + lists[0].length);

    }
  }

  // console.log(moves_lists);
  return double_steps;
}

// const dotSource = ` digraph G { A -> B;  B -> C;   C -> A;  }  `;


function moves2graph(double_steps) {

  var len = double_steps.length;
  var dotSource = "";
  dotSource = " digraph G { \r\n ";

  dotSource += "graph [";
  dotSource += "size = \"15,20\";\r\n";  // 图大小
  dotSource += "label = \"" + pgn_header + "\";\r\n";
  dotSource += "fontsize = 40;"; // 标题大小
  dotSource += "]\r\n";  

  dotSource += "node [fontsize=40];\r\n";  // 
  dotSource += "\r\n";

  // 填写lable
  for (var i = 0; i < len; i++) {
    var line = i + " [label=\"" + double_steps[i].white.step + ". " 
      + double_steps[i].white.move + " " 
      + double_steps[i].black.move;

      if (double_steps[i].white.comment != "")
        line += "\\n" + double_steps[i].white.comment + ".";
      if (double_steps[i].black.comment != "")
        line += double_steps[i].black.comment + ".";
      // + double_steps[i].white.id // 防止有重复步数
      line += "\"];\r\n";
    dotSource += line;
  }


  for (var i = 0; i < len; i++) {

    for (var par = 0; par < len; par++) {
      //查找每个节点对应父节点
      if (double_steps[i].white.parent == double_steps[par].black.id) {
        var line = par + " -> " + i + ";\r\n";
        dotSource += line;
      }
    }

  }

  dotSource += "}";

  console.log(dotSource);

  return dotSource;
}

// moves2list(moves);
// moves2graph(double_steps);

