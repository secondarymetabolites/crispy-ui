/* Copyright 2012 Kai Blin. Licensed under the Apache License v2.0, see LICENSE file */

var svgene = {
    version: "0.1.5",
    label_height: 14,
    extra_label_width: 100,
    unique_id: 0
};

svgene.geneArrowPoints = function (orf, height, offset, border, scale) {
  var top_ = offset + svgene.label_height + border;
  var bottom = offset + svgene.label_height + height - border;
  var middle = offset + svgene.label_height + (height/2);
  if (orf.strand == 1) {
      var start = scale(orf.start);
      var box_end = Math.max(scale(orf.end) - (2*border), start);
      var point_end = scale(orf.end);
      points  = "" + start + "," + top_;
      points += " " + box_end + "," + top_;
      points += " " + point_end + "," + middle;
      points += " " + box_end + "," + bottom;
      points += " " + start + "," + bottom;
      return points;
  }
  if (orf.strand == -1) {
      var point_start = scale(orf.start);
      var end = scale(orf.end);
      var box_start = Math.min(scale(orf.start) + (2*border), end);
      points = "" + point_start + "," + middle;
      points += " " + box_start + "," + top_;
      points += " " + end + "," + top_;
      points += " " + end + "," + bottom;
      points += " " + box_start + "," + bottom;
      return points;
  }
};

svgene.drawOrderedClusterOrfs = function(cluster, chart, all_orfs, ticks, scale,
                                         i, idx, height, width,
                                         single_cluster_height, offset) {
  chart.append("line")
    .attr("x1", 0)
    .attr("y1", (single_cluster_height * i) + svgene.label_height + (height/2))
    .attr("x2", width)
    .attr("y2", (single_cluster_height * i) + svgene.label_height + (height/2))
    .attr("class", "svgene-line");
  chart.selectAll("polygon")
    .data(all_orfs)
  .enter().append("polygon")
    .attr("points", function(d) { return svgene.geneArrowPoints(d, height, (single_cluster_height * i), offset, scale); })
    .attr("class", function(d) { return "svgene-type-other svgene-orf"; })
    .attr("id", function(d) { return idx + "-cluster" + cluster.idx + "-" + svgene.tag_to_id(d.id) + "-orf"; })
    .attr("style", function(d) { if (d.color !== undefined) { return "fill:" + d.color; } });
  chart.selectAll("rect")
    .data(ticks, function(d) { return d.id })
  .enter().append("rect")
    .attr("x", function(d) { return scale(d.start); })
    .attr("y", function(d) { var offset = 0; if (d.strand == -1) { offset = height * 0.8; }; return (single_cluster_height * i) + svgene.label_height + offset; })
    .attr("height", 10)
    .attr("width", function(d) { return Math.max(scale(d.end - d.start), 5)})
    .attr("id", function(d) { return d.id + '-tick'; })
    .attr("class", "svgene-tick");
  chart.selectAll("text")
    .data(all_orfs)
  .enter().append("text")
    .attr("x", function(d) { return scale(d.start); })
    .attr("y", (single_cluster_height * i) + svgene.label_height + offset/2)
    .attr("class", "svgene-locustag")
    .attr("id", function(d) { return idx + "-cluster" + cluster.idx + "-" + svgene.tag_to_id(d.id) + "-label"; })
    .text(function(d) { return d.id; });

};

svgene.drawUnorderedClusterOrfs = function(cluster, chart, all_orfs, ticks, scale,
                                           i, idx, height, width,
                                           single_cluster_height, offset) {
  chart.selectAll("rect")
    .data(all_orfs)
  .enter().append("rect")
    .attr("x", function(d) { return scale(d.start);})
    .attr("y", (single_cluster_height * i) + svgene.label_height + offset)
    .attr("height", height - (2 * offset))
    .attr("width", function(d) { return scale(d.end) - scale(d.start)})
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("class", function(d) { return "svgene-type-other svgene-orf"; })
    .attr("id", function(d) { return idx + "-cluster" + cluster.idx + "-" + svgene.tag_to_id(d.id) + "-orf"; })
    .attr("style", function(d) { if (d.color !== undefined) { return "fill:" + d.color; } });
  chart.selectAll("text")
    .data(all_orfs)
  .enter().append("text")
    .attr("x", function(d) { return scale(d.start); })
    .attr("y", (single_cluster_height * i) + svgene.label_height + offset/2)
    .attr("class", "svgene-locustag")
    .attr("id", function(d) { return idx + "-cluster" + cluster.idx + "-" + svgene.tag_to_id(d.id) + "-label"; })
    .text(function(d) { return d.id; });
};

svgene.drawClusters = function(id, clusters, height, width, best_size, best_offset) {
  var container = d3.select("#" + id);
  var single_cluster_height = height + svgene.label_height;
  container.selectAll("svg").remove();
  container.selectAll("div").remove();
  var chart = container.append("svg")
    .attr("height", single_cluster_height * clusters.length)
    .attr("width", width + svgene.extra_label_width);
  var all_orfs = [];

  for (i=0; i < clusters.length; i++) {
      var cluster = clusters[i];
      all_orfs.push.apply(all_orfs, cluster.orfs);
      var ticks = cluster.ticks;
      var idx = svgene.unique_id++;
      var offset = height/10;
      var x = d3.scale.linear()
        .domain([cluster.start, cluster.end])
        .range([0, width]);
      if (cluster.unordered) {
          svgene.drawUnorderedClusterOrfs(cluster, chart, all_orfs, ticks, x,
                                          i, idx, height, width,
                                          single_cluster_height, offset);
      } else {
          svgene.drawOrderedClusterOrfs(cluster, chart, all_orfs, ticks, x,
                                        i, idx, height, width,
                                        single_cluster_height, offset);
      }
      container.selectAll("div")
        .data(all_orfs)
      .enter().append("div")
        .attr("class", "svgene-tooltip")
        .attr("id", function(d) { return idx + "-cluster" + cluster.idx + "-" + svgene.tag_to_id(d.id) + "-tooltip"; })
        .html(function(d) { return '<h5>'+d.id+'</h5><a class="svgene-rescan" href="' + window.location.hash + '" id="' + svgene.tag_to_id(d.id) +
            '-rescan" data-from="' + d.start + '" data-to="' + d.end +'" data-size="' + best_size + '" data-offset="' + best_offset + '">Show results for this gene only</a>'});
  }
  for (i=0; i < clusters.length; i++) {
      var cluster = clusters[i];
      if (cluster.label !== undefined) {
        chart.append("text")
            .text(cluster.label)
            .attr("class", "svgene-clusterlabel")
            .attr("x", function() { return width + svgene.extra_label_width - this.getComputedTextLength() - 5})
            .attr("y", function() { return (single_cluster_height * i) + svgene.label_height } )
            .attr("font-size", svgene.label_height);
      }
  }
  svgene.init();
};

svgene.tag_to_id = function(tag) {
    return tag.replace(/(:|\.)/g, '-').replace(/-orf/g, '_orf');
}


svgene.tooltip_handler = function(ev) {
    var id = $(this).attr("id").replace("-orf", "-tooltip");
    var tooltip = $("#"+id);

    if (svgene.active_tooltip) {
        svgene.active_tooltip.hide();
    }
    svgene.active_tooltip = tooltip;

    if (tooltip.css("display") == 'none') {
        var offset = $(this).offset();
        tooltip.css("left", offset.left + 10);
        var this_parent = $(this).parent();
        var top_offset = this_parent.height()/(this_parent.children('line').length * 2);
        tooltip.css("top", offset.top + top_offset);
        tooltip.show();
        tooltip.click(function(){$(this).hide()});
        var timeout = setTimeout(function(){ tooltip.slideUp("fast") }, 5000);
        tooltip.data("timeout", timeout);
        tooltip.mouseover(function() {
            clearTimeout(tooltip.data("timeout"));
        }).mouseout(function() {
            timeout = setTimeout(function(){ tooltip.slideUp("fast") }, 5000);
            tooltip.data("timeout", timeout);
        });
    } else {
        tooltip.hide();
    }
};


svgene.rescan = function(ev) {
    var from = parseInt($(this).attr('data-from'));
    var to = parseInt($(this).attr('data-to'));
    var best_size = parseInt($(this).attr('data-size'));
    var best_offset = parseInt($(this).attr('data-offset'));
    var id = window.location.hash.split('/').pop();
    var uri = '/api/v1.0/genome/' + id;
    $.ajax({
        url: uri,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            from: from,
            to: to,
            best_size: best_size,
            best_offset: best_offset,
        }),
        success: function(data) {
            var uri_components = window.location.hash.split('/');
            uri_components.pop();
            var new_uri = uri_components.join('/');
            window.open(new_uri + '/' + data.id, '_self');
        },
        dataType: 'json',
    });
};

svgene.init = function() {
    $(".svgene-orf").mouseover(function(e) {
        var id = $(this).attr("id").replace("-orf", "-label");
        $("#"+id).show();
    }).mouseout(function(e) {
        var id = $(this).attr("id").replace("-orf", "-label");
        $("#"+id).hide();
    }).click(svgene.tooltip_handler);
    $(".svgene-rescan").click(svgene.rescan);
    $(".svgene-tick").mouseover(function(e) {
        var row = $(this).attr("id").replace("-tick", "-row");
        $("#"+row).addClass('tick-table-active');
        var class_str = $(this).attr('class') + ' active';
        $(this).attr('class', class_str);
        d3.select(this).toFront();
    }).mouseout(function(e) {
        var row = $(this).attr("id").replace("-tick", "-row");
        $("#"+row).removeClass('tick-table-active');
        var class_str = $(this).attr('class');
        class_str = class_str.replace(/ active/, '');
        $(this).attr('class', class_str);
    }).click(function(e) {
        var row = '#' + $(this).attr("id").replace("-tick", "-row");
        $(row).click();
    });
};
